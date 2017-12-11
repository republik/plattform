import MarkdownSerializer from 'slate-mdast-serializer'
import { parse } from '@orbiting/remark-preset'

export default ({rule, subModules, TYPE}) => {
  const childSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean)
  })

  const documentRule = {
    match: object => object.kind === 'document',
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      const res = {
        document: {
          data: node.meta,
          kind: 'document',
          nodes: childSerializer.fromMdast(node.children)
        },
        kind: 'value'
      }
      return res
    },
    toMdast: (object, index, parent, rest) => {
      return {
        type: 'root',
        meta: object.data,
        children: childSerializer.toMdast(object.nodes)
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [
      documentRule
    ]
  })

  const newDocument = ({title, template}) => serializer.deserialize(parse(
`---
template: ${template}
---

<section><h6>TEASER</h6>

\`\`\`
{
  "teaserType": "frontImage"
}
\`\`\`

![desert](/static/desert.jpg)

# The sand is near aka Teaser 3

An article by [Christof Moser](), 31 December 2017

<hr/></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "teaserType": "frontImage"
}
\`\`\`

![desert](/static/desert.jpg)

###### Teaser 1

# The sand is near

#### Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.

An article by [Christof Moser](), 31 December 2017

<hr/></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "teaserType": "frontImage"
}
\`\`\`

###### Teaser 2

# The sand is near

#### Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.

An article by [Christof Moser](), 31 December 2017

<hr/></section>

<section><h6>TEASER</h6>

\`\`\`
{
  "teaserType": "frontImage"
}
\`\`\`

![desert](/static/desert.jpg)

# The sand is near aka Teaser 3

#### Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.

An article by [Christof Moser](), 31 December 2017

<hr/></section>

`
  ))

  const Container = rule.component

  return {
    TYPE,
    helpers: {
      serializer,
      newDocument
    },
    changes: {},
    plugins: [
      {
        renderEditor: ({children}) => <Container>{children}</Container>
      }
    ]
  }
}
