import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

import {
  FigureImage
} from '../../components/Figure'

import {
  matchFigure,
  extractImage
} from '../Article/utils'

const matchLast = (node, index, parent) => index === parent.children.length - 1

const createSchema = ({
  Container,
  Cover,
  CoverImage,
  Center,
  Paragraph,
  Strong,
  Em,
  Link,
  Br,
  H2,
  Figure,
  Image,
  Caption,
  Byline,
  Blockquote,
  BlockquoteText,
  BlockquoteSource,
  List,
  ListItem
} = {}) => {

  const globalInlines = [
    {
      matchMdast: matchType('break'),
      component: Br,
      isVoid: true
    },
    {
      matchMdast: matchType('strong'),
      component: Strong,
      editorModule: 'mark',
      editorOptions: {
        type: 'strong'
      }
    }
  ]

  const link = {
    matchMdast: matchType('link'),
    component: Link,
    props: node => ({
      title: node.title,
      href: node.url
    }),
    editorModule: 'link'
  }

  const paragraph = {
    matchMdast: matchParagraph,
    component: Paragraph,
    editorModule: 'paragraph',
    editorOptions: {
      formatButtonText: 'Paragraph'
    },
    rules: [
      ...globalInlines,
      link,
      {
        matchMdast: matchType('emphasis'),
        component: Em,
        editorModule: 'mark',
        editorOptions: {
          type: 'emphasis'
        }
      }
    ]
  }

  const figureCaption = {
    matchMdast: matchParagraph,
    component: Caption,
    editorModule: 'figureCaption',
    editorOptions: {
      afterType: 'PARAGRAPH',
      insertAfterType: 'FIGURE',
      placeholder: 'Legende'
    },
    rules: [
      {
        matchMdast: matchType('emphasis'),
        component: Byline,
        editorOptions: {
          placeholder: 'Credit'
        }
      },
      link,
      ...globalInlines
    ]
  }

  const figure = {
    matchMdast: matchFigure,
    component: Figure,
    editorModule: 'figure',
    editorOptions: {
      pixelNote: 'Auflösung: min. 1200x (proportionaler Schnitt)',
      insertButtonText: 'Bild'
    },
    rules: [
      {
        matchMdast: matchImageParagraph,
        component: Image,
        props: (node, index, parent) => {
          const src = extractImage(node)
          const displayWidth = 600

          return {
            ...FigureImage.utils.getResizedSrcs(
              src,
              displayWidth
            ),
            alt: node.children[0].alt
          }
        },
        editorModule: 'figureImage',
        isVoid: true
      },
      figureCaption
    ]
  }

  const cover = {
    matchMdast: (node, index, parent) => {
      return (
        matchFigure(node) &&
        index === 0
    )},
    component: Cover,
    editorModule: 'figure',
    editorOptions: {
      type: 'COVERFIGURE',
      afterType: 'PARAGRAPH',
      pixelNote: 'Auflösung: min. 2000x (proportionaler Schnitt)'
    },
    rules: [
      {
        matchMdast: matchImageParagraph,
        component: CoverImage,
        props: (node, index, parent) => {
          const src = extractImage(node)
          const displayWidth = 1280

          return {
            ...FigureImage.utils.getResizedSrcs(
              src,
              displayWidth
            ),
            alt: node.children[0].alt
          }
        },
        editorModule: 'figureImage',
        editorOptions: {
          type: 'COVERFIGUREIMAGE',
        },
        isVoid: true
      },
      figureCaption
    ]
  }

  return {
    emailTemplate: 'newsletter-editorial',
    repoPrefix: 'newsletter-editorial-',
    rules: [
      {
        matchMdast: matchType('root'),
        component: Container,
        editorModule: 'documentPlain',
        rules: [
          {
            matchMdast: () => false,
            editorModule: 'meta',
            editorOptions: {
              additionalFields: ['emailSubject']
            }
          },
          cover,
          {
            matchMdast: matchZone('CENTER'),
            component: Center,
            editorModule: 'center',
            rules: [
              paragraph,
              figure,
              {
                matchMdast: matchHeading(2),
                component: H2,
                editorModule: 'headline',
                editorOptions: {
                  type: 'h2',
                  depth: 2,
                  formatButtonText: 'Zwischentitel'
                }
              },
              {
                matchMdast: matchZone('QUOTE'),
                component: Blockquote,
                editorModule: 'quote',
                editorOptions: {
                  insertButtonText: 'Zitat'
                },
                rules: [
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) &&
                      (index === 0 || !matchLast(node, index, parent)),
                    component: BlockquoteText,
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'QUOTEP',
                      placeholder: 'Zitat'
                    },
                    rules: [paragraph]
                  },
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) && matchLast(node, index, parent),
                    component: BlockquoteSource,
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'QUOTECITE',
                      placeholder: 'Quellenangabe / Autor'
                    },
                    rules: [paragraph]
                  }
                ]
              },
              {
                matchMdast: matchType('list'),
                component: List,
                props: node => ({
                  data: {
                    ordered: node.ordered,
                    start: node.start
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
            ]
          }
        ]
      }
    ]
  }
}

export default createSchema
