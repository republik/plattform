import React from 'react'
import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph
} from 'mdast-react-render/lib/utils'

import {
  H1,
  H2,
  P,
  A,
  NarrowContainer,
  Tweet,
  Video,
  Editorial
} from '@project-r/styleguide'

const Br = () => <br />
const Strong = ({ children, attributes = {} }) => (
  <strong {...attributes}>{children}</strong>
)
const Em = ({ children, attributes = {} }) => (
  <em {...attributes}>{children}</em>
)
const Del = ({ children, attributes = {} }) => (
  <del {...attributes}>{children}</del>
)
const Sub = ({ children, attributes = {} }) => (
  <sub {...attributes}>{children}</sub>
)
const Sup = ({ children, attributes = {} }) => (
  <sup {...attributes}>{children}</sup>
)

const paragraph = {
  matchMdast: matchParagraph,
  component: ({ children, attributes = {} }) => (
    <P {...attributes}>{children}</P>
  ),
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
      matchMdast: matchType('delete'),
      component: Del,
      editorModule: 'mark',
      editorOptions: {
        type: 'delete'
      }
    },
    {
      matchMdast: matchType('sub'),
      component: Sub,
      editorModule: 'mark',
      editorOptions: {
        type: 'sub'
      }
    },
    {
      matchMdast: matchType('sup'),
      component: Sup,
      editorModule: 'mark',
      editorOptions: {
        type: 'sup'
      }
    },
    {
      matchMdast: matchType('link'),
      props: node => ({
        data: {
          title: node.title,
          href: node.url
        }
      }),
      component: ({ children, data, attributes = {} }) => (
        <A href={data.href} title={data.title} {...attributes}>
          {children}
        </A>
      ),
      editorModule: 'link'
    }
  ]
}

const schema = {
  repoPrefix: 'dev-',
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children, attributes = {} }) => (
        <div {...attributes} style={{ padding: '20px 0' }}>
          {children}
        </div>
      ),
      editorModule: 'documentPlain',
      rules: [
        {
          matchMdast: () => false,
          editorModule: 'meta'
        },
        {
          matchMdast: matchZone('TITLE'),
          component: ({ children, attributes = {} }) => (
            <NarrowContainer {...attributes}>{children}</NarrowContainer>
          ),
          editorModule: 'title',
          rules: [
            {
              matchMdast: matchHeading(1),
              component: ({ children, attributes = {} }) => (
                <H1 {...attributes}>{children}</H1>
              ),
              editorModule: 'headline',
              editorOptions: {
                type: 'h1',
                placeholder: 'Titel',
                depth: 1
              }
            }
          ]
        },
        {
          matchMdast: matchZone('CENTER'),
          component: ({ children, attributes = {} }) => (
            <NarrowContainer {...attributes}>{children}</NarrowContainer>
          ),
          editorModule: 'center',
          rules: [
            {
              matchMdast: matchZone('EMBEDTWITTER'),
              component: props => <Tweet {...props.data} />,
              editorModule: 'embedTwitter',
              editorOptions: {
                lookupType: 'paragraph'
              }
            },
            {
              matchMdast: matchZone('EMBEDVIDEO'),
              component: props => <Video {...props.data} />,
              editorModule: 'embedVideo',
              editorOptions: {
                lookupType: 'paragraph'
              }
            },
            paragraph,
            {
              matchMdast: matchHeading(2),
              component: ({ children, attributes = {} }) => (
                <H2 {...attributes}>{children}</H2>
              ),
              editorModule: 'headline',
              editorOptions: {
                type: 'h2',
                depth: 2,
                formatButtonText: 'Zwischentitel'
              }
            },
            {
              matchMdast: matchType('list'),
              component: Editorial.List,
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
                  component: Editorial.LI,
                  editorModule: 'listItem',
                  rules: [paragraph]
                }
              ]
            }
          ]
        },
        {
          editorModule: 'specialchars'
        }
      ]
    }
  ]
}

export default schema
