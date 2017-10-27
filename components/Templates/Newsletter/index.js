import Container from './Container'
import Cover, {Title, Lead} from './Cover'
import Paragraph, {Strong, Em, Link, Br} from './Paragraph'
import Center from './Center'
import { H2, H3 } from './Headlines'
import Figure, { Image, Caption } from './Figure'
import Blockquote from './Blockquote'
import List, { ListItem } from './List'
import RBlueprint from './RBlueprint'

import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImageParagraph
} from '../utils'

const paragraph = {
  matchMdast: matchParagraph,
  component: Paragraph,
  identifier: 'PARAGRAPH',
  editorModule: 'paragraph',
  options: {
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
      identifier: 'BOLD',
      options: {
        type: 'strong'
      }
    },
    {
      matchMdast: matchType('emphasis'),
      component: Em,
      editorModule: 'mark',
      identifier: 'ITALIC',
      options: {
        type: 'emphasis'
      }
    },
    {
      matchMdast: matchType('link'),
      editorModule: 'link',
      getData: node => ({
        title: node.title,
        href: node.url
      }),
      component: Link
    }
  ]
}

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: Container,
      editorModule: 'document',
      rules: [
        {
          matchMdast: matchZone('COVER'),
          component: Cover,
          identifier: 'COVER',
          editorModule: 'cover',
          getData: node => {
            const img = node.children[0].children[0]
            return {
              alt: img.alt,
              src: img.url
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
              identifier: 'TITLE',
              editorModule: 'headline',
              options: {
                depth: 1,
                placeholder: 'Title'
              }
            },
            {
              matchMdast: matchParagraph,
              component: Lead,
              identifier: 'LEAD',
              editorModule: 'paragraph',
              options: {
                placeholder: 'Lead'
              },
              rules: paragraph.rules
            }
          ]
        },
        {
          matchMdast: matchZone('CENTER'),
          component: Center,
          identifier: 'CENTER',
          editorModule: 'center',
          rules: [
            paragraph,
            {
              matchMdast: matchHeading(2),
              component: H2,
              identifier: 'H2',
              editorModule: 'headline',
              options: {
                depth: 2,
                formatButtonText: 'Zwischentitel 1'
              }
            },
            {
              matchMdast: matchHeading(3),
              component: H3,
              identifier: 'H3',
              editorModule: 'headline',
              options: {
                depth: 3,
                formatButtonText: 'Zwischentitel 2'
              }
            },
            {
              matchMdast: matchZone('FIGURE'),
              component: Figure,
              rules: [
                {
                  matchMdast: matchImageParagraph,
                  component: Image,
                  getData: node => ({
                    src: node.children[0].url,
                    alt: node.children[0].alt
                  }),
                  isVoid: true
                },
                {
                  matchMdast: matchParagraph,
                  component: Caption,
                  getData: (node, parent) => (parent && parent.data) || {},
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
              getData: node => ({
                ordered: node.ordered,
                start: node.start
              }),
              rules: [
                {
                  matchMdast: matchType('listItem'),
                  component: ListItem,
                  rules: [paragraph]
                }
              ]
            },
            {
              matchMdast: matchZone('SPECIAL_R_BLUEPRINT'),
              component: RBlueprint,
              isVoid: true
            }
          ]
        }
      ]
    }
  ]
}

export default schema
