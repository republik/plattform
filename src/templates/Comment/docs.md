```code|lang-jsx
import createCommentSchema from '@project-r/styleguide/lib/templates/Comment'

const schema = createCommentSchema()
```

# Example

```react|noSource
<Markdown schema={schema}>{`

Ein Kommentar. [Ein Link](https://example.com/ "Mit Titel"). ![Ein Bild](/static/landscape.jpg?size=2000x1411 "Mit Bildtitel").

`}</Markdown>
```
