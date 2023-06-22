import MarkdownSerializer from '@republik/slate-mdast-serializer'
import { matchBlock } from '../../utils'
import { extractImages, matchImagesParagraph } from '@project-r/styleguide'

import { getData } from './'

export const getSubmodules = ({ subModules }) => {
  const [
    titleModule,
    subjectModule,
    leadModule,
    formatModule,
    paragraphModule,
  ] = subModules

  if (!titleModule) {
    throw new Error('Missing headline submodule')
  }

  if (!subjectModule) {
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

  const linkModule = paragraphModule.subModules.find((subModule) => {
    return subModule.name === 'link'
  })

  if (!linkModule) {
    throw new Error('Missing link module in paragraph submodule')
  }

  return {
    titleModule,
    subjectModule,
    leadModule,
    formatModule,
    paragraphModule,
    linkModule,
  }
}

const getRules = (subModules) =>
  subModules
    .reduce(
      (a, m) =>
        a.concat(
          m.helpers && m.helpers.serializer && m.helpers.serializer.rules,
        ),
      [],
    )
    .filter(Boolean)

const fromMdast =
  ({ TYPE, subModules, rule }) =>
  (node, index, parent, rest) => {
    const imageParagraph = node.children.find(matchImagesParagraph)

    // Remove module key from data
    const { module, ...data } = getData({
      ...rule.editorOptions.defaultValues,
      ...node.data,
    })
    if (imageParagraph) {
      const imgs = extractImages(imageParagraph)
      data.image = imgs.src
      data.imageDark = imgs.srcDark
    }

    const childSerializer = new MarkdownSerializer({
      rules: getRules(subModules),
    })

    const children = node.children.filter((node) => node !== imageParagraph)
    const lastChild = node.children[node.children.length - 1]
    if ((!lastChild || lastChild.type !== 'paragraph') && !data.onlyImage) {
      children.push({
        type: 'paragraph',
        children: [],
      })
    }

    const nodes = childSerializer
      .fromMdast(children, 0, node, {
        context: {
          ...rest.context,
          // pass link color to link through context
          color: data.color,
        },
      })
      // enhance all immediate children with data
      .map((node) => {
        const articleTilePatches =
          data.teaserType === 'articleTile' && node.type === 'FRONTSUBJECT'
            ? {
                columns: 3,
              }
            : undefined
        const formatHeadlinePatches =
          node.type === 'FRONTFORMAT'
            ? {
                logo: data.formatLogo,
                url: data.formatUrl,
              }
            : undefined
        return {
          ...node,
          data: {
            ...node.data,
            ...data,
            ...articleTilePatches,
            ...formatHeadlinePatches,
          },
        }
      })

    const result = {
      kind: 'block',
      type: data.onlyImage ? `${TYPE}_VOID` : TYPE,
      data: {
        ...data,
        module: 'teaser',
      },
      nodes: nodes,
    }
    return result
  }

const toMdast =
  ({ TYPE, subModules }) =>
  (node, index, parent, { visitChildren, context }) => {
    const args = [
      {
        visitChildren,
        context,
      },
    ]

    const childSerializer = new MarkdownSerializer({
      rules: getRules(subModules),
    })

    const { image, imageDark, module, ...data } = node.data
    const imageNode = image && {
      type: 'paragraph',
      children: [
        {
          type: 'image',
          url: image,
        },
      ].concat(
        imageDark
          ? [
              { type: 'text', value: ' ' },
              { type: 'image', url: imageDark },
            ]
          : [],
      ),
    }
    return {
      type: 'zone',
      identifier: 'TEASER',
      data,
      children: [
        ...(imageNode ? [imageNode] : []),
        ...childSerializer.toMdast(node.nodes, 0, node, ...args),
      ],
    }
  }

export const getSerializer = (options) =>
  new MarkdownSerializer({
    rules: [
      {
        match: (node) =>
          matchBlock(options.TYPE)(node) ||
          matchBlock(`${options.TYPE}_VOID`)(node),
        matchMdast: options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options),
      },
    ],
  })
