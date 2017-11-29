import MarkdownSerializer from 'slate-mdast-serializer'
import { matchBlock } from '../../utils'
import {
  matchImageParagraph,
  matchParagraph,
  matchHeading
} from 'mdast-react-render/lib/utils'

import { gray2x1 } from '../../utils/placeholder'

const fromMdast = ({
  TYPE,
  subModules
}) => (node,
  index,
  parent,
  {
    visitChildren,
    context
  }
) => {
  const titleModule = subModules.find(m => m.TYPE === 'TITLE')
  if (!titleModule) {
    throw new Error('Missing headline with type `TITLE` submodule')
  }

  const leadModule = subModules.find(m => m.TYPE === 'LEAD')
  if (!leadModule) {
    throw new Error('Missing headline with type `TITLE` submodule')
  }

  const formatModule = subModules.find(m => m.TYPE === 'FORMAT')
  if (!formatModule) {
    throw new Error('Missing headline with type `TITLE` submodule')
  }

  const paragraphModule = subModules.find(m => m.name === 'paragraph')
  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }

  const titleSerializer = titleModule.helpers.serializer
  const leadSerializer = leadModule.helpers.serializer
  const formatSerializer = formatModule.helpers.serializer

  const paragraphSerializer = paragraphModule.helpers.serializer

  const imageParagraph = node.children.find(matchImageParagraph)
  const title = node.children.find(matchHeading(1))
  const lead = node.children.find(matchHeading(4))
  const format = node.children.find(matchHeading(6))
  const credit = node.children.find(n => matchParagraph(n) && n !== imageParagraph)

  const data = {
    textPosition: 'topleft',
    color: '#fff',
    bgColor: '#000',
    center: false,
    image: imageParagraph
      ? imageParagraph.children[0].url
      : gray2x1,
    ...node.data
  }

  const nodes = [
    format && formatSerializer.fromMdast(format),
    title && titleSerializer.fromMdast(title),
    lead && leadSerializer.fromMdast(lead),
    credit && paragraphSerializer.fromMdast(credit)
  ]

  const result = {
    kind: 'block',
    type: TYPE,
    data,
    nodes: nodes.filter(v => !!v)
  }
  return result
}

const toMdast = ({
  TYPE,
  subModules
}) => (
  node,
  index,
  parent,
  {
    visitChildren,
    context
  }
) => {
  const childSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean).concat({
      matchMdast: (node) => node.type === 'break',
      fromMdast: () => ({
        kind: 'text',
        leaves: [{text: '\n'}]
      })
    })
  })
  return {
    type: 'zone',
    identifier: 'TEASER',
    children: childSerializer.toMdast(node.nodes)
  }
}

export default options =>
  new MarkdownSerializer({
    rules: [
      {
        match: matchBlock(options.TYPE),
        matchMdast:
          options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })
