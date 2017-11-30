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
    throw new Error('Missing headline with type `TITLE` submodule')
  }

  if (!leadModule) {
    throw new Error('Missing headline with type `LEAD` submodule')
  }

  if (!formatModule) {
    throw new Error('Missing headline with type `FORMAT` submodule')
  }

  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }

  return {
    titleModule,
    leadModule,
    formatModule,
    paragraphModule
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
    nodes: nodes.filter(v => !!v)
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
