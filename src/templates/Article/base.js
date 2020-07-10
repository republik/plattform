import React from 'react'
import scrollIntoView from 'scroll-into-view'
import globalMediaState, { parseTimeHash } from '../../lib/globalMediaState'

import * as Editorial from '../../components/Typography/Editorial'
import * as Meta from '../../components/Typography/Meta'

import {
  Figure,
  FigureImage,
  FigureCaption,
  FigureByline,
  FigureGroup
} from '../../components/Figure'

import { List, ListItem } from '../../components/List'

import { slug } from '../../lib/slug'

import {
  matchHeading,
  matchType,
  matchZone,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

import {
  matchFigure,
  getDisplayWidth,
  extractImage,
  globalInlines,
  styles,
  mdastToString
} from './utils'

const createBase = ({ metaBody }) => {
  const link = {
    matchMdast: matchType('link'),
    props: node => ({
      title: node.title,
      href: node.url
    }),
    component: props => {
      const { href } = props
      // workaround app issues with hash url by handling them ourselves and preventing the default behaviour
      if (href && href.slice(0, 3) === '#t=') {
        return (
          <Editorial.A
            {...props}
            onClick={e => {
              const time = parseTimeHash(href)
              if (time !== false) {
                e.preventDefault()
                globalMediaState.setTime(time)
              }
            }}
          />
        )
      }
      if (href && href[0] === '#') {
        return (
          <Editorial.A
            {...props}
            onClick={e => {
              const ele = document.getElementById(href.substr(1))
              if (ele) {
                e.preventDefault()
                scrollIntoView(ele, { time: 0, align: { top: 0 } })
              }
            }}
          />
        )
      }
      return <Editorial.A {...props} />
    },
    editorModule: 'link',
    rules: globalInlines
  }

  const paragraphFormatting = [
    {
      matchMdast: matchType('strong'),
      component: ({ attributes, children }) => (
        <strong {...attributes}>{children}</strong>
      ),
      editorModule: 'mark',
      editorOptions: {
        type: 'STRONG',
        mdastType: 'strong'
      }
    },
    {
      matchMdast: matchType('emphasis'),
      component: ({ attributes, children }) => (
        <em {...attributes}>{children}</em>
      ),
      editorModule: 'mark',
      editorOptions: {
        type: 'EMPHASIS',
        mdastType: 'emphasis'
      }
    }
  ]

  const paragraphRules = [
    ...globalInlines,
    ...paragraphFormatting,
    {
      ...link,
      rules: [...globalInlines, ...paragraphFormatting]
    }
  ]

  const Typography = metaBody ? Meta : Editorial

  const paragraph = {
    matchMdast: matchParagraph,
    component: Typography.P,
    editorModule: 'paragraph',
    editorOptions: {
      formatButtonText: 'Paragraph'
    },
    rules: paragraphRules
  }

  const subhead = {
    matchMdast: matchHeading(2),
    props: node => ({
      slug: slug(mdastToString(node))
    }),
    component: ({ children, slug }) => (
      <Typography.Subhead>
        <a {...styles.anchor} id={slug} />
        {children}
      </Typography.Subhead>
    ),
    editorModule: 'headline',
    editorOptions: {
      type: 'H2',
      depth: 2,
      formatButtonText: 'Zwischentitel',
      afterType: 'PARAGRAPH',
      insertAfterType: 'CENTER'
    },
    rules: globalInlines
  }

  const list = {
    matchMdast: matchType('list'),
    component: List,
    props: node => ({
      data: {
        ordered: node.ordered,
        start: node.start,
        compact: !node.loose
      }
    }),
    editorModule: 'list',
    rules: [
      {
        matchMdast: matchType('listItem'),
        component: ListItem,
        editorModule: 'listItem',
        rules: [paragraph]
      }
    ]
  }

  const figureImage = {
    matchMdast: matchImageParagraph,
    component: FigureImage,
    props: (node, index, parent, { ancestors }) => {
      const rootNode = ancestors[ancestors.length - 1]
      const meta = rootNode ? rootNode.meta : {}

      const src = extractImage(node)
      const displayWidth = getDisplayWidth(ancestors)
      const enableGallery =
        meta.gallery && (parent.data ? !parent.data.excludeFromGallery : true)

      const group = ancestors.find(matchZone('FIGUREGROUP'))

      let gallerySize, aboveTheFold
      if (group && group.data.slideshow) {
        const { slideshow, columns } = group.data

        const index = group.children.indexOf(parent)
        const numFigs = group.children.filter(matchFigure).length

        const galleryCover =
          index === slideshow * columns - 1 && numFigs > slideshow * columns

        gallerySize = galleryCover ? numFigs : undefined

        const hidden = index > slideshow * columns - 1
        // hidden images are wrapped in a noscript tag
        // setting aboveTheFold ensure that the figure
        // does not create a second noscript tag
        aboveTheFold = hidden || undefined
      }

      return {
        ...FigureImage.utils.getResizedSrcs(src, displayWidth),
        alt: node.children[0].alt,
        enableGallery,
        gallerySize,
        aboveTheFold
      }
    },
    editorModule: 'figureImage',
    isVoid: true
  }

  const figureByLine = {
    matchMdast: matchType('emphasis'),
    component: FigureByline,
    editorModule: 'paragraph',
    editorOptions: {
      type: 'BYLINE',
      placeholder: 'Credit'
    }
  }

  const figureCaption = {
    matchMdast: matchParagraph,
    component: FigureCaption,
    editorModule: 'figureCaption',
    editorOptions: {
      isStatic: true,
      placeholder: 'Legende'
    },
    rules: [figureByLine, link, ...globalInlines]
  }

  const figure = {
    matchMdast: matchFigure,
    component: ({ hidden, ...rest }) => {
      const fig = <Figure {...rest} />
      if (hidden) {
        return <noscript>{fig}</noscript>
      }
      return fig
    },
    props: (node, index, parent, { ancestors }) => {
      const group = ancestors.find(matchZone('FIGUREGROUP'))

      let hidden = false
      if (group && group.data.slideshow) {
        const { slideshow, columns } = group.data
        const index = group.children.indexOf(node)
        hidden = index > slideshow * columns - 1
      }

      return {
        hidden,
        size: node.data.size
      }
    },
    editorModule: 'figure',
    editorOptions: {
      pixelNote:
        'Auflösung: min. 1200x, für E2E min. 2000x (proportionaler Schnitt)',
      sizes: [
        {
          label: 'Edge to Edge',
          props: { size: undefined },
          parent: {
            kinds: ['document', 'block'],
            types: ['CENTER']
          },
          unwrap: true
        },
        {
          label: 'Gross',
          props: { size: 'breakout' },
          parent: {
            kinds: ['document', 'block'],
            types: ['CENTER']
          },
          wrap: 'CENTER'
        },
        {
          label: 'Normal',
          props: { size: undefined },
          parent: {
            kinds: ['document', 'block'],
            types: ['CENTER']
          },
          wrap: 'CENTER'
        }
      ]
    },
    rules: [figureImage, figureCaption]
  }

  const centerFigureCaption = {
    ...figureCaption,
    editorOptions: {
      ...figureCaption.editorOptions,
      type: 'CENTERFIGURECAPTION',
      afterType: 'PARAGRAPH',
      insertAfterType: 'CENTER'
    },
    rules: [
      {
        ...figureByLine,
        editorOptions: {
          ...figureByLine.editorOptions,
          type: 'CENTERBYLINE'
        }
      },
      link,
      ...globalInlines
    ]
  }

  const centerFigure = {
    ...figure,
    editorOptions: {
      ...figure.editorOptions,
      insertButtonText: 'Bild',
      insertTypes: ['PARAGRAPH'],
      type: 'CENTERFIGURE'
    },
    rules: [figureImage, centerFigureCaption]
  }

  const figureGroup = {
    matchMdast: matchZone('FIGUREGROUP'),
    component: FigureGroup,
    props: node => {
      return {
        size: node.data.size || 'breakout',
        columns: node.data.columns
      }
    },
    rules: [figure, centerFigureCaption],
    editorModule: 'figuregroup',
    editorOptions: {
      insertButtonText: 'Bildergruppe',
      insertTypes: ['PARAGRAPH']
    }
  }

  return {
    link,
    subhead,
    paragraph,
    paragraphRules,
    list,
    figure,
    figureImage,
    figureCaption,
    figureGroup,
    centerFigure
  }
}

export default createBase
