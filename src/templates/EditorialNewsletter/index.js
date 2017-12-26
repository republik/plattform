import Container from './Container'
import Cover, { Title, Lead } from './Cover'
import Paragraph, { Strong, Em, Link, Br } from './Paragraph'
import Center from './Center'
import { H2 } from './Headlines'
import Figure, { Image, Caption, Byline } from './Figure'
import Blockquote, { BlockquoteText, BlockquoteSource } from './Blockquote'
import List, { ListItem } from './List'

import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

const matchLast = (node, index, parent) => index === parent.children.length - 1

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

const schema = {
  emailTemplate: 'newsletter-editorial',
  repoPrefix: 'newsletter-editorial-',
  rules: [
    {
      matchMdast: matchType('root'),
      component: Container,
      editorModule: 'document',
      rules: [
        {
          matchMdast: () => false,
          editorModule: 'meta',
          editorOptions: {
            additionalFields: ['emailSubject']
          }
        },
        {
          matchMdast: matchZone('COVER'),
          component: Cover,
          editorModule: 'cover',
          props: node => {
            const img = node.children[0].children[0]
            return {
              data: {
                alt: img.alt,
                src: img.url
              }
            }
          },
          rules: [
            {
              matchMdast: matchImageParagraph,
              component: () => null,
              isVoid: true
            },
            {
              matchMdast: matchHeading(1),
              component: Title,
              editorModule: 'headline',
              editorOptions: {
                type: 'title',
                depth: 1,
                placeholder: 'Title'
              }
            },
            {
              matchMdast: matchType('paragraph'),
              component: Lead,
              editorModule: 'paragraph',
              editorOptions: {
                type: 'lead',
                placeholder: 'Lead'
              },
              rules: paragraph.rules
            }
          ]
        },
        {
          matchMdast: matchZone('CENTER'),
          component: Center,
          editorModule: 'center',
          rules: [
            paragraph,
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
              matchMdast: matchZone('FIGURE'),
              component: Figure,
              editorModule: 'figure',
              editorOptions: {
                afterType: 'PARAGRAPH',
                pixelNote:
                  'Anzeigegrössen: 1200x und 600x (proportionaler Schnitt)',
                insertButtonText: 'Bild',
                captionRight: true,
                sizes: [
                  { label: 'Gross', props: { float: undefined } },
                  { label: 'Left', props: { float: 'left' } },
                  { label: 'Right', props: { float: 'right' } }
                ]
              },
              rules: [
                {
                  matchMdast: matchImageParagraph,
                  component: Image,
                  props: node => ({
                    src: node.children[0].url,
                    alt: node.children[0].alt
                  }),
                  editorModule: 'figureImage',
                  isVoid: true
                },
                figureCaption
              ]
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

export default schema
module.exports = schema
