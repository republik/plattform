import MarkdownSerializer from 'slate-mdast-serializer'
import { matchBlock } from '../../utils'
import {
  matchImageParagraph,
  matchParagraph,
  matchHeading
} from 'mdast-react-render/lib/utils'

import { getData } from './'

export const getSubmodules = ({ subModules }) => {
  const [titleModule, leadModule, formatModule, paragraphModule] = subModules

  if (!titleModule) {
    throw new Error('Missing headline submodule')
  }

  if (!leadModule) {
    throw new Error('Missing headline submodule')
  }

  if (!formatModule) {
    throw new Error('Missing headline submodule')
  }

  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }

  const linkModule = paragraphModule.subModules[0]

  if (!linkModule) {
    throw new Error('Missing link module in paragraph submodule')
  }

  return {
    titleModule,
    leadModule,
    formatModule,
    paragraphModule,
    linkModule
  }
}

export const fromMdast = ({
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
  const {
    titleModule,
    leadModule,
    formatModule,
    paragraphModule
  } = getSubmodules({ subModules })

  const titleSerializer = titleModule.helpers.serializer
  const leadSerializer = leadModule.helpers.serializer
  const formatSerializer = formatModule.helpers.serializer
  const paragraphSerializer = paragraphModule.helpers.serializer

  const imageParagraph = node.children.find(matchImageParagraph)
  const title = node.children.find(matchHeading(1))
  const lead = node.children.find(matchHeading(4))
  const format = node.children.find(matchHeading(6))
  const credit = node.children.find(n => matchParagraph(n) && n !== imageParagraph)

  const data = getData(node.data)
  if (imageParagraph) {
    data.image = imageParagraph.children[0].url
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
    nodes: nodes.filter(v => !!v).map(v => ({...v, data}))
  }
  return result
}

export const toMdast = ({
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
  const args = [
    {
      visitChildren,
      context
    }
  ]

  const childSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean)
  })

  const { image, ...data } = node.data
  const imageNode = image && {
    type: 'paragraph',
    children: [
      {
        type: 'image',
        url: image
      }
    ]
  }
  return {
    type: 'zone',
    identifier: 'TEASER',
    data,
    children: [
      ...(imageNode ? [imageNode] : []),
      ...childSerializer.toMdast(node.nodes, 0, node, ...args)
    ]
  }
}

export const getSerializer = options =>
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
