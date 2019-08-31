import MarkdownSerializer from 'slate-mdast-serializer'
import { parse } from '@orbiting/remark-preset'
import { Set, is } from 'immutable'

import { matchBlock } from '../../utils'
import { extract as extractRepoId } from '../../utils/github'

export default ({ rule, subModules, TYPE }) => {
  const childSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean)
  })

  let invisibleNodes

  const documentRule = {
    match: object => object.kind === 'document',
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      const visibleNodes = node.children.slice(0, 100)
      invisibleNodes = node.children.slice(100)
      const res = {
        document: {
          data: node.meta,
          kind: 'document',
          nodes: childSerializer.fromMdast(visibleNodes)
        },
        kind: 'value'
      }
      return res
    },
    toMdast: (object, index, parent, rest) => {
      return {
        type: 'root',
        meta: object.data,
        children: childSerializer.toMdast(object.nodes).concat(invisibleNodes)
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [
      documentRule
    ]
  })

  const newDocument = ({ title, template }) => serializer.deserialize(parse(`
---
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

`.trim()
  ))

  const Container = rule.component

  const matchLiveTeaserFeed = matchBlock('LIVETEASERFEED')
  const extractUrls = nodes => {
    if (!nodes) {
      return Set()
    }
    return nodes.reduce(
      (set, node) => set
        .add(node.data && node.data.get('url'))
        .concat(extractUrls(node.nodes)),
      Set()
    )
  }
  const extractRepoIds = nodes =>
    extractUrls(nodes)
      .filter(Boolean)
      .map(url => {
        const info = extractRepoId(url)
        return info && info.id
      })
      .filter(Boolean)

  return {
    TYPE,
    helpers: {
      serializer,
      newDocument
    },
    changes: {},
    plugins: [
      {
        renderEditor: ({ children }) => <Container>{children}</Container>,
        onChange: (change) => {
          const liveTeaserFeedIndex = change.value.document.nodes
            .findIndex(matchLiveTeaserFeed)

          if (liveTeaserFeedIndex) {
            const liveTeaserFeed = change.value.document.nodes.get(liveTeaserFeedIndex)
            const priorNodes = change.value.document.nodes.slice(0, liveTeaserFeedIndex)
            const priorRepoIds = extractRepoIds(priorNodes)

            if (!is(liveTeaserFeed.data.get('priorRepoIds'), priorRepoIds)) {
              change.setNodeByKey(liveTeaserFeed.key, {
                data: liveTeaserFeed.data.set('priorRepoIds', priorRepoIds)
              })
              return change
            }
          }
        }
      }
    ]
  }
}
