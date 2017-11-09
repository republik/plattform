import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph
} from 'mdast-react-render/lib/utils'

import {
  H1, H2,
  P, A, NarrowContainer
} from '@project-r/styleguide'

const Br = () => <br />
const Strong = ({ children, attributes = {} }) =>
  <strong {...attributes}>{ children }</strong>
const Em = ({ children, attributes = {} }) =>
  <em {...attributes}>{ children }</em>
const Del = ({ children, attributes = {} }) =>
  <del {...attributes}>{ children }</del>

const paragraph = {
  matchMdast: matchParagraph,
  component: ({ children, attributes = {} }) =>
    <P {...attributes}>{children}</P>,
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
      matchMdast: matchType('link'),
      getData: node => ({
        title: node.title,
        href: node.url
      }),
      component: ({ children, data, attributes = {} }) =>
        <A
          href={data.href}
          title={data.title}
          {...attributes}>
          {children}
        </A>,
      editorModule: 'link'
    }
  ]
}

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children, attributes = {} }) =>
        <div {...attributes} style={{padding: '20px 0'}}>{children}</div>,
      editorModule: 'documentPlain',
      rules: [
        {
          matchMdast: () => false,
          editorModule: 'meta'
        },
        {
          matchMdast: matchZone(
            'CENTER'
          ),
          component: ({ children, attributes = {} }) =>
            <NarrowContainer {...attributes}>{children}</NarrowContainer>,
          editorModule: 'center',
          rules: [
            {
              matchMdast: matchZone(
                'EMBED'
              ),
              component: ({ data }) => (
                <pre
                  style={{lineHeight: '1em'}}
                >
                  {JSON.stringify(data, null, 3)}
                </pre>
              ),
              editorModule: 'embed',
              editorOptions: {
                lookupType: 'paragraph'
              }
            },
            paragraph,
            {
              matchMdast: matchHeading(
                1
              ),
              component: ({ children, attributes = {} }) =>
                <H1 {...attributes}>{children}</H1>,
              editorModule: 'headline',
              editorOptions: {
                type: 'h1',
                depth: 1,
                formatButtonText:
                  'Zwischentitel 1'
              }
            },
            {
              matchMdast: matchHeading(
                2
              ),
              component: ({ children, attributes = {} }) =>
                <H2 {...attributes}>{children}</H2>,
              editorModule: 'headline',
              editorOptions: {
                type: 'h2',
                depth: 2,
                formatButtonText:
                  'Zwischentitel 2'
              }
            }
          ]
        }
      ]
    }
  ]
}

export default schema
