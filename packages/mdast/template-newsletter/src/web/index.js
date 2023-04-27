import Container from './Container'
import Cover, {
  Title,
  Lead
} from './Cover'
import Paragraph, {
  Strong,
  Em,
  Link,
  Br
} from './Paragraph'
import Center from './Center'
import { H2, H3 } from './Headlines'
import Figure, {
  Image,
  Caption
} from './Figure'
import Blockquote from './Blockquote'
import List, { ListItem } from './List'
import RBlueprint from './RBlueprint'
import RepublikShareholder from './RepublikShareholder'
import Teaser from './Teaser'

import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

const paragraph = {
  matchMdast: matchParagraph,
  component: Paragraph,
  editorModule: 'paragraph',
  editorOptions: {
    formatButtonText: 'Paragraph'
  },
  rules: [
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
    },
    {
      matchMdast: matchType('emphasis'),
      component: Em,
      editorModule: 'mark',
      editorOptions: {
        type: 'emphasis'
      }
    },
    {
      matchMdast: matchType('link'),
      props: node => ({
        title: node.title,
        href: node.url
      }),
      component: Link,
      editorModule: 'link'
    }
  ]
}

const schema = {
  emailTemplate: 'newsletter-email',
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
            additionalFields: ['emailSubject'],
            teaser: Teaser
          }
        },
        {
          matchMdast: matchZone(
            'COVER'
          ),
          component: Cover,
          props: node => {
            const img =
              node.children[0]
                .children[0]
            return {
              data: {
                alt: img.alt,
                src: img.url
              }
            }
          },
          editorModule: 'cover',
          rules: [
            {
              matchMdast: matchImageParagraph,
              component: () => null,
              isVoid: true
            },
            {
              matchMdast: matchHeading(
                1
              ),
              component: Title,
              editorModule: 'headline',
              editorOptions: {
                type: 'title',
                depth: 1,
                placeholder: 'Title'
              }
            },
            {
              matchMdast: matchParagraph,
              component: Lead,
              editorModule: 'paragraph',
              editorOptions: {
                type: 'lead',
                placeholder: 'Lead'
              },
              rules: paragraph.rules
            },
            // support legacy blockquote lead for rendering
            {
              matchMdast: matchType('blockquote'),
              component: Lead,
              rules: [
                paragraph
              ]
            }
          ]
        },
        {
          matchMdast: matchZone(
            'CENTER'
          ),
          component: Center,
          editorModule: 'center',
          rules: [
            paragraph,
            {
              matchMdast: matchHeading(
                2
              ),
              component: H2,
              editorModule: 'headline',
              editorOptions: {
                type: 'h2',
                depth: 2,
                formatButtonText:
                  'Zwischentitel 1'
              }
            },
            {
              matchMdast: matchHeading(
                3
              ),
              component: H3,
              editorModule: 'headline',
              editorOptions: {
                type: 'h3',
                depth: 3,
                formatButtonText:
                  'Zwischentitel 2'
              }
            },
            {
              matchMdast: matchZone('FIGURE'),
              component: Figure,
              props: node => ({
                float: node.data.float
              }),
              editorModule: 'figure',
              editorOptions: {
                afterType: 'PARAGRAPH',
                pixelNote: 'Anzeigegrössen: 1200x und 600x (proportionaler Schnitt)',
                insertButtonText: 'Bild',
                captionRight: true,
                sizes: [
                  {label: 'Gross', props: {float: undefined}},
                  {label: 'Left', props: {float: 'left'}},
                  {label: 'Right', props: {float: 'right'}},
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
                {
                  matchMdast: matchParagraph,
                  component: Caption,
                  props: (node, index, parent) => ({
                    data: (parent && parent.data) || {}
                  }),
                  editorModule: 'figureCaption',
                  editorOptions: {
                    type: 'figureCaption',
                    placeholder: 'Legende'
                  },
                  rules: paragraph.rules
                }
              ]
            },
            {
              matchMdast: matchType('blockquote'),
              component: Blockquote,
              editorModule: 'blockquote',
              rules: [
                paragraph
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
            },
            {
              matchMdast: matchZone('SPECIAL_R_BLUEPRINT'),
              component: RBlueprint,
              isVoid: true,
              editorModule: 'special'
            },
            {
              matchMdast: matchZone('SPECIAL_REPUBLIK_SHAREHOLDER'),
              component: RepublikShareholder,
              isVoid: true,
              editorModule: 'special'
            }
          ]
        }
      ]
    }
  ]
}

export default schema
module.exports = schema
