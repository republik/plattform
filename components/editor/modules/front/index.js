import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { parse } from '@orbiting/remark-preset'
import { Set, is } from 'immutable'

import { matchBlock } from '../../utils'
import { extract as extractRepoId } from '../../utils/github'

export default ({ rule, subModules, TYPE }) => {
  const matchLiveTeaserFeed = matchBlock('LIVETEASERFEED')
  const extractUrls = nodes => {
    if (!nodes) {
      return Set()
    }
    return nodes.reduce(
      (set, node) =>
        set
          .add(
            node.data && (node.data.get ? node.data.get('url') : node.data.url)
          )
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

  const getAutoFeedData = doc => {
    const liveTeaserFeedIndex = doc.nodes.findIndex(matchLiveTeaserFeed)

    if (liveTeaserFeedIndex !== -1) {
      const liveTeaserFeed = doc.nodes.get
        ? doc.nodes.get(liveTeaserFeedIndex)
        : doc.nodes[liveTeaserFeedIndex]
      const priorNodes = doc.nodes.slice(0, liveTeaserFeedIndex)
      const priorRepoIds = extractRepoIds(priorNodes)

      return {
        priorRepoIds,
        liveTeaserFeed
      }
    }
  }

  const childSerializer = new MarkdownSerializer({
    rules: subModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules
          ),
        []
      )
      .filter(Boolean)
  })

  const documentRule = {
    match: object => object.kind === 'document',
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      const visibleNodes = node.children.slice(0, 100)
      const invisibleMdastNodes = node.children.slice(100)
      const res = {
        document: {
          data: {
            ...node.meta,
            invisibleMdastNodes
          },
          kind: 'document',
          nodes: childSerializer.fromMdast(visibleNodes)
        },
        kind: 'value'
      }
      const feedData = getAutoFeedData(res.document)
      if (feedData) {
        feedData.liveTeaserFeed.data.priorRepoIds = feedData.priorRepoIds
      }
      return res
    },
    toMdast: (object, index, parent, rest) => {
      const { invisibleMdastNodes, ...meta } = object.data
      return {
        type: 'root',
        meta,
        children: childSerializer
          .toMdast(object.nodes)
          .concat(invisibleMdastNodes)
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [documentRule]
  })

  const newDocument = ({ title, schema }) =>
    serializer.deserialize(
      parse(
        `
---
template: ${schema}
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
      )
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
        renderEditor: ({ children }) => <Container>{children}</Container>,
        onChange: change => {
          const feedData = getAutoFeedData(change.value.document)

          if (feedData) {
            if (
              !is(
                feedData.liveTeaserFeed.data.get('priorRepoIds'),
                feedData.priorRepoIds
              )
            ) {
              change.setNodeByKey(feedData.liveTeaserFeed.key, {
                data: feedData.liveTeaserFeed.data.set(
                  'priorRepoIds',
                  feedData.priorRepoIds
                )
              })
              return change
            }
          }
        }
      }
    ]
  }
}
