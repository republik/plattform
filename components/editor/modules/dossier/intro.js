import React from 'react'
import { matchBlock } from '../../utils'
import { Block } from 'slate'

import MarkdownSerializer from 'slate-mdast-serializer'
import { matchImageParagraph } from 'mdast-react-render/lib/utils'

import { TeaserForm } from '../teaser/ui'

const getSubmodules = ({ subModules }) => {
  const [formatModule, titleModule, leadModule] = subModules

  if (!titleModule) {
    throw new Error('Missing headline submodule')
  }

  if (!leadModule) {
    throw new Error('Missing headline submodule')
  }

  if (!formatModule) {
    throw new Error('Missing headline submodule')
  }

  return {
    titleModule,
    leadModule,
    formatModule
  }
}

const getRules = subModules =>
  subModules
    .reduce(
      (a, m) =>
        a.concat(
          m.helpers && m.helpers.serializer && m.helpers.serializer.rules
        ),
      []
    )
    .filter(Boolean)

const fromMdast = options => {
  return (node, index, parent, rest) => {
    const { TYPE, subModules } = options
    const imageParagraph = node.children.find(matchImageParagraph)

    // Remove module key from data
    const { module, ...data } = getData(node.data)
    if (imageParagraph) {
      data.image = imageParagraph.children[0].url
    }

    const childSerializer = new MarkdownSerializer({
      rules: getRules(subModules)
    })

    const nodes = childSerializer
      .fromMdast(
        node.children.filter(node => node !== imageParagraph),
        0,
        node,
        {
          context: {
            ...rest.context,
            // pass link color to link through context
            color: data.color
          }
        }
      )
      // enhance all immediate children with data
      .map(node => ({ ...node, data: { ...node.data, ...data } }))
    const result = {
      kind: 'block',
      type: TYPE,
      data: {
        ...getData(data),
        module: 'teaser'
      },
      nodes: nodes
    }
    return result
  }
}

const toMdast = options => {
  return (node, index, parent, rest) => {
    const { subModules } = options
    const { visitChildren, context } = rest

    const args = [
      {
        visitChildren,
        context
      }
    ]

    const childSerializer = new MarkdownSerializer({
      rules: getRules(subModules)
    })

    const { image, module, ...data } = node.data
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
      data: getData(data),
      children: [
        ...(imageNode ? [imageNode] : []),
        ...childSerializer.toMdast(node.nodes, 0, node, ...args)
      ]
    }
  }
}

const getSerializer = options =>
  new MarkdownSerializer({
    rules: [
      {
        match: matchBlock(options.TYPE),
        matchMdast: options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })

const getData = data => ({
  url: null,
  textPosition: 'topleft',
  color: '#000',
  bgColor: '#fff',
  center: false,
  image: null,
  kind: 'editorial',
  titleSize: 'standard',
  teaserType: 'dossierIntro',
  reverse: false,
  portrait: true,
  showImage: true,
  onlyImage: false,
  ...(data || {})
})

const getNewBlock = options => () => {
  const { formatModule, titleModule, leadModule } = getSubmodules(options)

  const data = getData()

  const res = Block.create({
    type: options.TYPE,
    data: {
      ...data,
      module: 'teaser'
    },
    nodes: [
      Block.create({
        type: formatModule.TYPE,
        data
      }),
      Block.create({
        type: titleModule.TYPE,
        data
      }),
      Block.create({
        type: leadModule.TYPE,
        data
      })
    ]
  })
  return res
}

const introPlugin = options => {
  const { TYPE, rule } = options

  // const {
  //   titleModule,
  //   leadModule,
  //   formatModule,
  //   paragraphModule
  // } = getSubmodules(options)

  const Intro = rule.component

  return {
    renderNode({ editor, node, attributes, children }) {
      if (!matchBlock(TYPE)(node)) {
        return
      }

      const image =
        node.data.get('showImage') === true
          ? node.data.get('image') || '/static/placeholder.png'
          : null

      return (
        <Intro {...node.data.toJS()} image={image} attributes={attributes}>
          {children}
        </Intro>
      )
    }
  }
}

export default options => ({
  rule: options.rule,
  helpers: {
    serializer: getSerializer(options),
    newItem: getNewBlock(options)
  },
  plugins: [introPlugin(options)],
  ui: {
    insertButtons: [],
    forms: [TeaserForm({ subModuleResolver: getSubmodules, ...options })]
  }
})
