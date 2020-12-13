const SNAPSHOT = "__snapshots";

// Main

export default function transformFactory({ types: t }) {
  return {
    visitor: {
      Program(path) {
        /**
         * const __snap = require("snapshot");
         * const __snapshots = __snap.createSnapshot();
         */
        path.node.body.unshift(createSnapshotInitialization(t));
        path.node.body.unshift(createSnapshotImport(t));

        const visitor = {
          ExportDefaultDeclaration(path) {
            const { declaration } = path.node;

            // Only allow function default exports
            t.assertFunctionDeclaration(declaration);
            const funcName = declaration.id?.name;

            /**
             * Set this function as the entry point of the script. We're going to
             * return everything in `inferredData` later so the app can use them.
             */
            this.inferredData.entryPoint = funcName;

            declaration.params.forEach((param) => {
              /**
               * For the entry point, only support identifiers as parameters right
               * now i.e. not things like ({ a, b }) => {} or (a, ...rest) => {}.
               *
               * There's various edge cases with these expressions related to
               * putting in custom inputs, so we're leaving them out for simplicity.
               */
              t.assertIdentifier(param);
              this.inferredData.params.push(param.name);
            });

            /**
             * Finally, remove the `export default` so it can be used with eval.
             */
            path.replaceWith(path.node.declaration);
          },
          FunctionDeclaration(path) {
            /**
             * Declare all function parameters so they're not skipped by the
             * snapshotting function.
             */
            path.node.params.forEach((param) => {
              const names = getNames(t, param);
              names.forEach((name) => this.declared.add(name));
            });
          },
          DebuggerStatement(path) {
            const scope = Object.keys(path.scope.getAllBindings()).filter((name) =>
              this.declared.has(name)
            );
            path.replaceWith(
              createSnapshot(t, [
                ...scope,
                { line: String(path.node.loc?.start.line) },
              ])
            );
          },
          VariableDeclarator(path) {
            const names = getNames(t, path.node.id);
            names.forEach((name) => this.declared.add(name));
          },
        };

        const inferredData = {
          params: [],
          entryPoint: null,
        };

        path.traverse(visitor, { declared: new Set(), inferredData });

        buildMetadata(t, path.node, inferredData);
      },
    },
  };
}

// Helpers

function getNames(t, node) {
  if (t.isIdentifier(node)) {
    return [node.name];
  }
  if (t.isArrayPattern(node)) {
    return node.elements.flatMap((node) => (node === null ? [] : getNames(t, node)));
  }
  if (t.isObjectPattern(node)) {
    return node.properties.flatMap((prop) => getNames(t, prop));
  }
  if (t.isObjectProperty(node)) {
    return getNames(t, node.key);
  }
  return [];
}

// Node builders

function buildMetadata(t, program, data) {
  const params = t.identifier("__params");
  program.body.push(
    createVariable(
      t,
      params,
      t.arrayExpression(data.params.map((name) => t.stringLiteral(name)))
    )
  );

  const entryPoint = t.identifier("__entryPoint");
  program.body.push(createVariable(t, entryPoint, t.identifier(data.entryPoint)));

  const meta = t.identifier("__meta");
  program.body.push(
    createVariable(
      t,
      meta,
      createObjectExpression(
        t,
        ["__params", "__entryPoint", SNAPSHOT].map((name) => [name.slice(2), name])
      )
    )
  );
  program.body.push(t.identifier("__meta"));
}

function createVariable(t, id, init) {
  return t.variableDeclaration("const", [t.variableDeclarator(id, init)]);
}

function createSnapshot(t, scope) {
  const parsedScope = scope
    .filter((scope) => (typeof scope === "string" ? scope !== SNAPSHOT : scope))
    .map((stringOrVal) => {
      if (typeof stringOrVal === "string") {
        return [stringOrVal, stringOrVal];
      } else {
        const [key, val] = Object.entries(stringOrVal)[0];
        return [key, val];
      }
    });
  /* __snapshot.push({ ...scope }) */
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(t.identifier(SNAPSHOT), t.identifier("push")),
      [createObjectExpression(t, parsedScope)]
    )
  );
}

function createObjectExpression(t, entries) {
  return t.objectExpression(
    entries.map(([key, val]) =>
      t.objectProperty(t.identifier(key), t.identifier(val))
    )
  );
}

function createSnapshotImport(t) {
  /* const __snap = require("snapshot") */
  return t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier("__snap"),
      t.callExpression(t.identifier("require"), [t.stringLiteral("snapshot")])
    ),
  ]);
}

function createSnapshotInitialization(t) {
  /* const __snapshots = __snap.createSnapshot() */
  return t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(SNAPSHOT),
      t.callExpression(
        t.memberExpression(t.identifier("__snap"), t.identifier("createSnapshot")),
        []
      )
    ),
  ]);
}
