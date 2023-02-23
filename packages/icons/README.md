# @republik/icons

## Build & Dev Scripts

The build-script consists of two commands:

1. Using [`svgr`](https://react-svgr.com/) the svg-files are converted into React-components (outputted into `lib/components`)

2. In a second step `vite.js` is used to bundle the output of the previous step as a CSJ & ESM bundle. In addtion the type-descriptions are generated as well.

The dev-script uses `nodemon` to watch the `lib/svg` folder. If a change is detected, the build-script is re-run.

## Adding an icon

To add an icon, simply add a `.svg` file into the `lib/svg` folder.

### How to import

| Icon-path | How to import |
| ------- | ------- |
| `/lib/svg/MenuIcon.svg` | `import { MenuIcon } from '@republik/icons` |
| `/lib/svg/0.svg` | `import { Svg0 } from '@republik/icons/md'` |
