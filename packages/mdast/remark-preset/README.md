# Remark Preset

Preconfigured [remark](https://github.com/remarkjs/remark) for our projects.

## API

### `parse`

```js
import { parse } from '@orbiting/remark-preset'

parse(md): Mdast
```

`md`: String  
The markdown to parse.

Returns a mdast tree.

### `stringify`

```js
import { stringify } from '@orbiting/remark-preset'

stringify(mdast): String
```

`mdast`: Object  
The mdast tree to stringify.

Returns a markdown string.

## Features

### Custom Mdast Type `zone`

```html
<section><h6>IDENTIFIER</h6>

Group arbitrary markdown

<hr /></section>
```

Yields following AST:

```js
{
  type: 'zone',
  identfier: 'IDENTIFIER',
  children: [{type: 'paragraph', children: [
    {type: 'text', value: 'Group arbitrary markdown'}
  ]}]
}
```

Zones can be nested and can have data (stringified as json in a code node). Under the hood the zone type is expanded and collapsed into flat nodes wrapped by `html` nodes with the section markup.

### `sub` and `sup` Types

```html
# CO<sub>2</sub>

40 µg/m<sup>3</sup>
```

Yields following AST:

```js
[
  {
    type: 'heading',
    depth: 1,
    children: [
      {type: 'text', value: 'CO'},
      {
        type: 'sub',
        children: [
          {type: 'text', value: '2'}
        ]
      }
    ]
  },
  {
    type: 'paragraph',
    children: [
      {type: 'text', value: '40 µg/m'},
      {
        type: 'sup',
        children: [
          {type: 'text', value: '3'}
        ]
      }
    ]
  }
]
```

### `span` Type

Need custom inline nodes? Use `span`.

```html
<span data-number="10000">10'000</span>
```

Yields following AST:

```js
{
  type: 'paragraph',
  children: [
    {
      type: 'span',
      data: {
        number: '10000'
      },
      children: [
        {
          type: 'text',
          value: '10\'000'
        }
      ]
    }
  ]
}
```

`node.data` must be a flat object with only strings. Each key gets mapped to its own data attribute. You can store complex data, if you really need to, by using one key with stringified json.

### Meta Data

Yaml meta data on `root.meta`. Powered by `js-yaml` and `remark-frontmatter`.

## Utils

If want only want the features and configure the unified processors yourself, you can import them individually:

```js
import unified from 'unified'
import remarkStringify from 'remark-stringify'
import remarkParse from 'remark-parse'
import frontmatter from 'remark-frontmatter'

import * as meta from '@orbiting/remark-preset/lib/meta'
import * as zone from '@orbiting/remark-preset/lib/zone'
import * as tag from '@orbiting/remark-preset/lib/tag'
import * as span from '@orbiting/remark-preset/lib/span'

unified()
  .use(remarkParse, {
    // your options
  })
  .use(frontmatter, ['yaml'])
  .use(meta.parse)
  .use(zone.collapse({
    test: ({type, value}) => {
      // your logic
    },
    mutate: (start, nodes, end) => {
      // your logic
      return {
        type: 'zone',
        children: nodes
      }
    }
  }))
  .use(span.collapse)
  .use(tag.collapse('sub'))

const stringifier = unified()
  .use(remarkStringify, {
    // your options
  })
  .use(frontmatter, ['yaml'])
  .use(meta.format)
  .use(zone.expand({
    test: ({type}) => type === 'zone',
    mutate: (node) => {
      // your logic
      return [
        {
          type: 'html',
          value: `<section>`
        },
        ...node.children,
        {
          type: 'html',
          value: '</section>'
        }
      ]
    }
  }))
  .use(span.expand)
  .use(tag.expand('sub'))
```
