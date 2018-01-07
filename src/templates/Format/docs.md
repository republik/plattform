A preconfigured article template for format pages.

```code|lang-jsx
import createFormatSchema from '@project-r/styleguide/lib/templates/Format'

const schema = createFormatSchema()
```

`createFormatSchema` take the same keys as the article template.

Defaults:
- `repoPrefix`, `format-`
- `customMetaFields`, repo refs for `discussion`, `dossier` and `format` settings with a `kind` (font) and `color` field.
