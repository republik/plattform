# Mdast React Render

A util to render an [MDAST](https://github.com/syntax-tree/mdast) tree accroding to a schema.

## API

### `rule` object

```js
{
  matchMdast: fn(mdast, index, parent): Boolean,
  props: fn(mdast, index, parent, {ancestors}): Object,
  rules: [rule],
  isVoid: Boolean,
  component: ReactComponent
}
```

- `matchMdast`
  Return true if the rule should render the mdast node.
- `props`
  Extract props from mdast to be passed to `component`. Additional context is available from the ordered `ancestors` array—index zero is equal to the parent.
- `rules`
  Optional array of sub rules to render children with. Defaults to recursively visit children.
- `isVoid`
  Skip rendering children. Default `false`.
- `component`
  The React component to render.

### `renderMdast`

```js
import { renderMdast } from 'mdast-react-render'

renderMdast(mdast, schema, options): ReactElement | [ReactElement]
```

`mdast`: `Mdast | [Mdast]`  
The mdast tree to render.

`schema.rules`: `[rule]`  
Rules to render with

`options.MissingNode`: `false | ReactComponent`  
A component to display when no rules matches. You can also pass false to throw if there is an unhandled mdast node. The component receives an `node`, `index`, `parent` and `ancestors` prop.

`options.ancestors`: `undefined | [Mdast]`  
If you're rendering a sub tree you should pass the ancestors via options. The immediate parent is expected at index 0. Used for `matchMdast` (immediate parent) and `props` (parent and ancestors).

### `renderEmail`

```js
import { renderMdast } from 'mdast-react-render/lib/email'

renderEmail(mdast, schema, options): HtmlString
```

A drop in replacement for rendering emails. Params like `renderMdast` with following addition:

`options.doctype`: `String`  
Defaults to a `xhtml1-transitional` doctype string.

Renders with `renderMdast`, stringifies with renderToStaticMarkup `ReactDOMServer.renderToStaticMarkup`, add a doctype and supports Outlook conditional comments via the mso component.

#### `<Mso>`

A dangerous helper for Outlook conditional comments.

Props:
- `gte`: `String`  
  a optional gte conition, usually `'15'`
- `children`: `String`  
  a dangerous html string to be between the conditional comment.

Usage:
```js
import { Mso } from 'mdast-react-render/lib/email'

<Mso>
  {`
  <style>
    img {
      width:800px !important;
    }
  </style>
  `}
</Mso>
```

### General Note

The `schema` and `rule` objects can and should be enriched with arbitrary additional data your app might need e.g. initiate an editor for the `schema`.

## Utils

The packages also includes a suite of utils useful for writing your schemas.

- `matchType(type: String): matchMdastFn`
- `matchHeading(depth: Number): matchMdastFn`
- `matchZone(identifier: String): matchMdastFn`  
  `zone` is a custom mdast node type
- `matchParagraph: matchMdastFn`
- `matchImage: matchMdastFn`
- `matchImageParagraph: matchMdastFn`  
  A paragraph with one image child
- `imageSizeInfo(url: string): null | {width, height}`  
  Parses an url with an `?size=${width}x${height}` suffix
- `imageResizeUrl(url: string, size: string)`  
  Appends a `resize` query param with `size` as value

```js
import { matchImageParagraph } from 'mdast-react-render/lib/utils'
```

## Example

[Try it in your browser.](https://runkit.com/tpreusse/mdast-react-render)

```js
import assert from 'assert'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { renderMdast } from 'mdast-react-render'
import { matchType, matchHeading, matchParagraph } from 'mdast-react-render/lib/utils'

Enzyme.configure({ adapter: new Adapter() })

const mdast = {
  'type': 'root',
  'children': [
    {
      'type': 'heading',
      'depth': 1,
      'children': [{
        'type': 'text',
        'value': 'The Titel'
      }]
    },
    {
      'type': 'paragraph',
      'children': [{
        'type': 'text',
        'value': '«A good lead.»'
      }]
    }
  ]
}


const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children }) => <div>{children}</div>,
      rules: [
        {
          matchMdast: matchHeading(1),
          component: ({ children }) => <h1>{children}</h1>
        },
        {
          matchMdast: matchParagraph,
          component: ({ children }) => <p>{children}</p>
        }
      ]
    }
  ]
}

assert.doesNotThrow(() => {
shallow(
  renderMdast(mdast, schema, {MissingNode: false})
)
})
```

## Example Email

```js
import assert from 'assert'
import React from 'react'

import { renderMdast, Mso } from 'mdast-react-render/lib/email'
import { matchType } from 'mdast-react-render/lib/utils'

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children }) => (
        <html>
          <head>
            <Mso gte='15'>
              {`
              <xml>
                <o:officedocumentsettings>
                  <o:allowpng />
                  <o:pixelsperinch>96</o:pixelsperinch>
                </o:officedocumentsettings>
              </xml>
              `}
            </Mso>
          </head>
          <body>
            {children}
          </body>
        </html>
      )
    }
  ]
}

const mdast = {
  'type': 'root',
  'children': []
}

let emailHtml
assert.doesNotThrow(() => {
  emailHtml = renderEmail(mdast, schema, {MissingNode: false})
})

assert.notEqual(
  emailHtml.indexOf('<!--[if gte mso 15]>'),
  -1,
  'transforms <Mso gte=\'15\'> into html comment'
)
```
