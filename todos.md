# Todos

## Features

- [ ] Make argument list reactive to function parameters and allow users to update that list
- [ ] Show current debug location

## Fixes

- [ ] Typing an unfinished `while` loop causes the app to crash
  - Any infinite loop here will cause the app to crash, `while` is one case
  - One method is to offload running the function to a worker (so it's async) then setting a timeout
- [ ] Transformer doesn't work with arrow functions
