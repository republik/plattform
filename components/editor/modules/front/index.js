import MarkdownSerializer from 'slate-mdast-serializer'

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
      return {
        document: {
          data: node.meta,
          kind: 'document',
          nodes: childSerializer.fromMdast(node.children)
        },
        kind: 'value'
      }
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

  const newDocument = ({title, template}) => serializer.deserialize(
`---
template: ${template}
---

<section><h6>TEASER</h6>

Teaser 1

<hr/></section>

<section><h6>TEASER</h6>

Teaser 2

<hr/></section>

<section><h6>TEASER</h6>

Teaser 3

<hr/></section>
`
  )

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
