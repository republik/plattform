import React from 'react'

import * as Editorial from '../../components/Typography/Editorial'
import * as Interaction from '../../components/Typography/Interaction'

import { FigureCover, FigureImage } from '../../components/Figure'

import { BlockQuote, BlockQuoteParagraph } from '../../components/BlockQuote'

import {
  PullQuote,
  PullQuoteText,
  PullQuoteSource
} from '../../components/PullQuote'

import { FIGURE_SIZES } from '../../components/Figure'

import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

import {
  InfoBox,
  InfoBoxTitle,
  InfoBoxText,
  InfoBoxListItem,
  InfoBoxSubhead,
  INFOBOX_DEFAULT_IMAGE_SIZE
} from '../../components/InfoBox'

import {
  matchLast,
  matchInfoBox,
  matchQuote,
  matchFigure,
  extractImage,
  globalInlines,
  styles,
  mdastToString
} from './utils'

import { slug } from '../../lib/slug'

const createBlocks = ({ base, COVER_TYPE, t, onAudioCoverClick }) => {
  const createInfoBox = ({ t }) => ({
    matchMdast: matchInfoBox,
    component: InfoBox,
    props: (node, index, parent, { ancestors }) => ({
      t,
      size: node.data.size,
      collapsable: node.data.collapsable,
      figureSize: node.children.find(matchFigure)
        ? node.data.figureSize || INFOBOX_DEFAULT_IMAGE_SIZE
        : undefined,
      figureFloat: node.data.figureFloat
    }),
    editorModule: 'infobox',
    editorOptions: {
      insertButtonText: 'Infobox',
      insertTypes: ['PARAGRAPH']
    },
    rules: [
      {
        matchMdast: matchHeading(3),
        props: node => ({
          slug: slug(mdastToString(node))
        }),
        component: ({ children, slug }) => (
          <InfoBoxTitle>
            <a {...styles.anchor} id={slug} />
            {children}
          </InfoBoxTitle>
        ),
        editorModule: 'headline',
        editorOptions: {
          type: 'INFOH',
          depth: 3,
          placeholder: 'Title',
          isStatic: true
        },
        rules: globalInlines
      },
      {
        matchMdast: matchHeading(4),
        component: InfoBoxSubhead,
        editorModule: 'headline',
        editorOptions: {
          placeholder: 'Zwischentitel',
          type: 'INFOH2',
          depth: 4,
          afterType: 'INFOP',
          insertAfterType: 'INFOBOX',
          formatButtonText: 'Infobox Zwischentitel',
          formatTypes: ['INFOP']
        },
        rules: globalInlines
      },
      {
        ...base.list,
        editorOptions: {
          ...base.list.editorOptions,
          type: 'INFOLIST',
          formatButtonText: 'Infobox Liste',
          formatButtonTextOrdered: 'Infobox Aufzählung',
          formatTypes: ['INFOP']
        },
        rules: [
          {
            matchMdast: matchType('listItem'),
            component: InfoBoxListItem,
            editorModule: 'listItem',
            editorOptions: {
              type: 'INFOLISTITEM'
            },
            rules: [
              {
                matchMdast: matchParagraph,
                component: InfoBoxText,
                editorModule: 'paragraph',
                editorOptions: {
                  type: 'INFOP',
                  placeholder: 'Infotext'
                },
                rules: base.paragraphRules
              }
            ]
          }
        ]
      },
      {
        ...base.figure,
        editorOptions: {
          ...base.figure.editorOptions,
          type: 'INFOFIGURE'
        },
        rules: [
          base.figureImage,
          {
            ...base.figureCaption,
            editorOptions: {
              type: 'INFOFIGURECAPTION',
              placeholder: 'Legende',
              isStatic: true
            }
          }
        ]
      },
      {
        matchMdast: matchParagraph,
        component: InfoBoxText,
        editorModule: 'paragraph',
        editorOptions: {
          type: 'INFOP',
          placeholder: 'Infotext'
        },
        rules: base.paragraphRules
      }
    ]
  })

  const blockQuote = {
    matchMdast: matchZone('BLOCKQUOTE'),
    props: node => {
      return {
        isEmpty:
          node.children &&
          node.children.length === 1 &&
          !node.children[0].children
      }
    },
    component: ({ isEmpty, node, children, attributes }) =>
      isEmpty ? null : (
        <BlockQuote attributes={attributes}>{children}</BlockQuote>
      ),
    editorModule: 'blockquote',
    editorOptions: {
      insertButtonText: 'Block-Zitat'
    },
    rules: [
      {
        matchMdast: matchType('blockquote'),
        component: ({ children }) => children,
        editorModule: 'blocktext',
        editorOptions: {
          type: 'BLOCKQUOTETEXT',
          mdastType: 'blockquote',
          isStatic: true
        },
        rules: [
          {
            matchMdast: matchParagraph,
            editorModule: 'paragraph',
            editorOptions: {
              type: 'BLOCKQUOTEPARAGRAPH',
              placeholder: 'Zitat-Absatz'
            },
            component: BlockQuoteParagraph,
            rules: base.paragraphRules
          }
        ]
      },
      base.figureCaption
    ]
  }

  const pullQuote = {
    matchMdast: matchQuote,
    component: PullQuote,
    props: (node, index, parent, { ancestors }) => ({
      size: node.data.size,
      hasFigure: !!node.children.find(matchFigure)
    }),
    editorModule: 'quote',
    editorOptions: {
      insertButtonText: 'Zitat',
      insertTypes: ['PARAGRAPH']
    },
    rules: [
      base.figure,
      {
        matchMdast: (node, index, parent) =>
          matchParagraph(node) &&
          (index === 0 ||
            (index === 1 && matchFigure(parent.children[0])) ||
            !matchLast(node, index, parent)),
        component: PullQuoteText,
        editorModule: 'paragraph',
        editorOptions: {
          type: 'QUOTEP',
          placeholder: 'Zitat'
        },
        rules: [...globalInlines, base.link]
      },
      {
        matchMdast: (node, index, parent) =>
          matchParagraph(node) && matchLast(node, index, parent),
        component: PullQuoteSource,
        editorModule: 'paragraph',
        editorOptions: {
          type: 'QUOTECITE',
          placeholder: 'Quellenangabe / Autor',
          isStatic: true,
          afterType: 'PARAGRAPH',
          insertAfterType: 'CENTER'
        },
        rules: [...globalInlines, base.link]
      }
    ]
  }

  const createCover = ({ onAudioCoverClick }) => ({
    matchMdast: (node, index) => matchFigure(node) && index === 0,
    component: FigureCover,
    props: (node, index, parent, { ancestors }) => {
      let text
      const rootNode = ancestors[ancestors.length - 1]
      const meta = rootNode.meta
      const headline = (
        (rootNode.children.find(matchZone('TITLE')) || {}).children || []
      ).find(matchHeading(1))

      if (meta.coverText && headline) {
        const Headline =
          rootNode.format &&
          rootNode.format.meta &&
          rootNode.format.meta.kind === 'meta'
            ? Interaction.Headline
            : Editorial.Headline
        const element = (
          <Headline
            style={{
              color: meta.coverText.color,
              fontSize: meta.coverText.fontSize,
              lineHeight: meta.coverText.lineHeight || 1.03
            }}
          >
            {mdastToString(headline)}
          </Headline>
        )

        text = {
          element,
          anchor: meta.coverText.anchor,
          offset: meta.coverText.offset
        }
      }
      return {
        size: node.data.size,
        text,
        audio: meta.audioCover && {
          ...meta.audioCover,
          onClick: onAudioCoverClick
        }
      }
    },
    editorModule: 'figure',
    editorOptions: {
      type: COVER_TYPE,
      gallery: false,
      afterType: 'PARAGRAPH',
      insertAfterType: 'CENTER',
      pixelNote: 'Auflösung: min. 2000x (proportionaler Schnitt)',
      sizes: [
        {
          label: 'Edge to Edge',
          props: { size: undefined }
        },
        {
          label: 'Gross',
          props: { size: 'breakout' }
        },
        {
          label: 'Zentriert',
          props: { size: 'center' }
        },
        {
          label: 'Klein',
          props: { size: 'tiny' }
        }
      ]
    },
    rules: [
      {
        matchMdast: matchImageParagraph,
        component: FigureImage,
        props: (node, index, parent, { ancestors }) => {
          const src = extractImage(node)
          const displayWidth = FIGURE_SIZES[parent.data.size] || 1500
          const setMaxWidth = parent.data.size !== undefined

          const rootNode = ancestors[ancestors.length - 1]
          const meta = rootNode ? rootNode.meta : {}
          const enableGallery =
            meta.gallery !== false &&
            (parent.data ? !parent.data.excludeFromGallery : true)

          return {
            ...FigureImage.utils.getResizedSrcs(src, displayWidth, setMaxWidth),
            enableGallery,
            aboveTheFold: true,
            alt: node.children[0].alt
          }
        },
        editorModule: 'figureImage',
        isVoid: true
      },
      base.figureCaption
    ]
  })

  const logbook = {
    matchMdast: matchZone('LOGBOOK'),
    component: ({ children }) => <div>{children}</div>,
    editorModule: 'logbook',
    editorOptions: {
      insertButtonText: 'Logbuch'
    },
    rules: [
      {
        matchMdast: matchHeading(2),
        component: Editorial.Subhead,
        editorModule: 'headline',
        editorOptions: {
          placeholder: 'Titel',
          type: 'LOGBOOK_TITLE',
          depth: 2,
          isStatic: true
        },
        rules: globalInlines
      },
      {
        matchMdast: matchParagraph,
        component: Editorial.Credit,
        editorModule: 'paragraph',
        editorOptions: {
          type: 'LOGBOOK_CREDIT',
          placeholder: 'Autoren, Datum',
          isStatic: true,
          afterType: 'PARAGRAPH',
          insertAfterType: 'CENTER'
        },
        rules: [...globalInlines, base.link]
      }
    ]
  }

  return {
    cover: createCover({ onAudioCoverClick }),
    infoBox: createInfoBox({ t }),
    logbook,
    blockQuote,
    pullQuote
  }
}

export default createBlocks
