> This is a forked version from https://github.com/ianstormtaylor/slate/tree/slate-react%400.10.23, modified for compatibility with React 19
>
> - Removed build deps and scripts because they're not necessary in the monorepo
> - Added `find-dom-node-polyfill` package

This package contains the React-specific logic for Slate. It's separated further into a series of directories:

- [**Components**](./src/components) — containing the React components for rendering Slate editors.
- [**Constants**](./src/constants) — containing a few private constants modules.
- [**Plugins**](./src/plugins) — containing the React-specific plugins for Slate editors.
- [**Utils**](./src/utils) — containing a few private convenience modules.

Feel free to poke around in each of them to learn more!
