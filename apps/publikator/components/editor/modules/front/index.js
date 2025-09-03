import MarkdownSerializer from '@republik/slate-mdast-serializer'
import { is, Set } from 'immutable'

import { matchBlock } from '../../utils'
import { extract as extractRepoId } from '../../utils/github'
import { getFrontTemplate } from './frontTemplate'

export default ({ rule, subModules, TYPE }) => {
  const matchLiveTeaserFeed = matchBlock('LIVETEASERFEED')
  const extractUrls = (nodes) => {
    if (!nodes) {
      return Set()
    }
    return nodes.reduce(
      (set, node) =>
        set
          .add(
            node.data && (node.data.get ? node.data.get('url') : node.data.url),
          )
          .concat(extractUrls(node.nodes)),
      Set(),
    )
  }
  const extractRepoIds = (nodes) =>
    extractUrls(nodes)
      .filter(Boolean)
      .map((url) => {
        const info = extractRepoId(url)
        return info && info.id
      })
      .filter(Boolean)

  const getAutoFeedData = (doc) => {
    const liveTeaserFeedIndex = doc.nodes.findIndex(matchLiveTeaserFeed)

    if (liveTeaserFeedIndex !== -1) {
      const liveTeaserFeed = doc.nodes.get
        ? doc.nodes.get(liveTeaserFeedIndex)
        : doc.nodes[liveTeaserFeedIndex]
      const priorNodes = doc.nodes.slice(0, liveTeaserFeedIndex)
      const priorRepoIds = extractRepoIds(priorNodes)

      return {
        priorRepoIds,
        liveTeaserFeed,
      }
    }
  }

  const childSerializer = new MarkdownSerializer({
    rules: subModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules,
          ),
        [],
      )
      .filter(Boolean),
  })

  const documentRule = {
    match: (object) => object.kind === 'document',
    matchMdast: rule.matchMdast,
    fromMdast: (node) => {
      const visibleNodes = node.children.slice(0, 60)
      const invisibleMdastNodes = node.children.slice(60)
      const res = {
        document: {
          data: {
            ...node.meta,
            invisibleMdastNodes,
          },
          kind: 'document',
          nodes: childSerializer.fromMdast(visibleNodes),
        },
        kind: 'value',
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
          .concat(invisibleMdastNodes),
      }
    },
  }

  const serializer = new MarkdownSerializer({
    rules: [documentRule],
  })

  const newDocument = ({ schema }) => {
    const mdastTemplate = getFrontTemplate({ schema })
    console.log('mdastTemplate', mdastTemplate)
    return serializer.deserialize(mdastTemplate)
  }

  const Container = rule.component

  return {
    TYPE,
    helpers: {
      serializer,
      newDocument,
    },
    changes: {},
    plugins: [
      {
        renderEditor: ({ children }) => <Container>{children}</Container>,
        onChange: (change) => {
          const feedData = getAutoFeedData(change.value.document)

          if (feedData) {
            if (
              !is(
                feedData.liveTeaserFeed.data.get('priorRepoIds'),
                feedData.priorRepoIds,
              )
            ) {
              change.setNodeByKey(feedData.liveTeaserFeed.key, {
                data: feedData.liveTeaserFeed.data.set(
                  'priorRepoIds',
                  feedData.priorRepoIds,
                ),
              })
              return change
            }
          }
        },
      },
    ],
  }
}
