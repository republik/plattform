A preconfigured article template for discussion pages.

```code|lang-jsx
import createDiscussionSchema from '@project-r/styleguide/lib/templates/Discussion'

const schema = createDiscussionSchema()
```

`createDiscussionSchema` take the same keys as the article template.

Defaults:
- `repoPrefix`, `discussion-`
- `customMetaFields`, repo refs for `format`, `dossier` and `discussion` settings with a `commentsMaxLength`, `commentsMinInterval` and `discussionAnonymity` field.
