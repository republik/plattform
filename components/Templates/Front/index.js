import {
  matchType,
  matchZone,
  matchParagraph
} from 'mdast-react-render/lib/utils'

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children, attributes = {} }) =>
        <div {...attributes} style={{padding: '20px 0'}}>{children}</div>,
      editorModule: 'front',
      rules: [
        {
          matchMdast: () => false,
          editorModule: 'meta'
        },
        {
          matchMdast: matchZone('TEASER'),
          component: ({ children, attributes = {} }) =>
            <div {...attributes}>{children}</div>,
          editorModule: 'teaser',
          rules: [
            {
              matchMdast: matchParagraph,
              component: ({ children, attributes = {} }) =>
                <p {...attributes}>{children}</p>,
              editorModule: 'paragraph',
              rules: []
            }
          ]
        }
      ]
    }
  ]
}

export default schema
