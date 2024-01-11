# @republik/icons

## Build & Dev Scripts

The build-script consists of two commands:

1. Using [`svgr`](https://react-svgr.com/) the svg-files are converted into React-components (outputted into `lib/components`)

2. In a second step `tsup` is used to bundle the output of the previous step as a CSJ & ESM bundle. In addtion the type-descriptions are generated as well.

The dev-script uses `nodemon` to watch the `lib/svg` folder. If a change is detected, the build-script is re-run.

## Adding an icon

To add a new icon, add a `.svg` file into the `lib/svg` folder.

### Adding A Material Symbol

Get the SVG file for the icon you need from [Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols).

**Make sure to set the Weight to 300 and Optical Size to 48 in the Filters panel before you download it**

### How to import

| Icon-path           | How to import                               |
| ------------------- | ------------------------------------------- |
| `/lib/svg/Menu.svg` | `import { IconMenu } from '@republik/icons` |
| `/lib/svg/0.svg`    | `import { Svg0 } from '@republik/icons/md'` |
