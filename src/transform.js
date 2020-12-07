const SNAPSHOT = "__snapshots";

// Main

export default function transformFactory({ types: t }) {
  return {
    pre() {
      this.declared = new Set();
    },
    visitor: {
      Program(path) {
        path.node.body.unshift(createSnapshotImport(t));
      },
      FunctionDeclaration(path) {
        // Only transform top-level function declarations
        if (t.isProgram(path.parent)) {
          const funcName = path.node.id?.name;
          path.node.params.forEach((param) => {
            const names = getNames(t, param);
            names.forEach((name) => this.declared.add(name));
          });
          path.node.body.body.unshift(createSnapshotInitialization(t));
          path.parent.body.push(t.identifier(funcName));
          path.traverse(
            {
              ReturnStatement(path) {
                const nearestAncestor = getClosestFunctionAncestor(t, path);
                if (nearestAncestor === this.funcName) {
                  path.node.argument = createSnapshotReturn(t, path.node);
                }
              },
            },
            { funcName }
          );
        }
      },
      DebuggerStatement(path) {
        const scope = Object.keys(path.scope.getAllBindings()).filter((name) =>
          this.declared.has(name)
        );
        path.replaceWith(
          createSnapshot(t, [...scope, { line: String(path.node.loc?.start.line) }])
        );
      },
      VariableDeclarator(path) {
        const names = getNames(t, path.node.id);
        names.forEach((name) => this.declared.add(name));
      },
    },
  };
}

// helpers

function getClosestFunctionAncestor(t, path) {
  let parent = path.parentPath;
  while (parent) {
    if (t.isFunctionDeclaration(parent.node)) {
      return parent.node.id?.name;
    }
    parent = parent.parentPath;
  }
  return null;
}

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

function isExport(t, node) {
  return t.isExportNamedDeclaration(node) || t.isExportDefaultDeclaration(node);
}

// Node builders

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
      [
        t.objectExpression(
          parsedScope.map(([key, val]) =>
            t.objectProperty(t.identifier(key), t.identifier(val))
          )
        ),
      ]
    )
  );
}

function createSnapshotImport(t) {
  /* import __snap from '../lib/snapshot' */
  /* return t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier("__snap"))],
    t.stringLiteral("../../lib/snapshot")
  ); */

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

function createSnapshotReturn(t, node) {
  /* return args -> return [args, __snapshots.data] */
  return t.arrayExpression([
    node.argument || t.nullLiteral(),
    t.memberExpression(t.identifier(SNAPSHOT), t.identifier("data")),
  ]);
}
