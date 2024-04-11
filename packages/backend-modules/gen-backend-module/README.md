
---
# Backend Module Generation Script

This package contains a script for generating a new backend module that is TypeScript compatible.

## How to Use

You can run this script either by calling it directly:

```sh
packages/backend-modules/gen-backend-module/index.js new backend-module <module-name>
```

or by running the package.json script `gen:module` from the root package.json:

```sh
yarn run gen:module <module-name>
```

The script can take an optional `--author` or `-a` flag for setting the author field in the generated package.json

```sh
yarn run gen:module <module-name> -a 'Republik Contributor <r.c@republik.ch>'
```
