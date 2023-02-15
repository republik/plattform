# @republik/icons

## Adding an icon

To add an icon, simply add a `.svg` file into the `svg` folder.
Once you run the `build` script again, your icon will be ready to use.
You can import it from the entrypoint generated from it's location within the icons
folder. See the explanation below on how the imports are grouped.

### How to import

| Icon-path | How to import |
| ------- | ------- |
| `/lib/svg/MenuIcon.svg` | `import { MenuIcon } from '@republik/icons` |
| `/lib/svg/md/SearchIcon.svg` | `import { SearchIcon } from '@republik/icons/md'` |
| `/lib/svg/md/md/CopyIcon.svg` (Please don't nest subfolders) | `import { CopyIcon } from '@republik/icons/mdMd'` |
