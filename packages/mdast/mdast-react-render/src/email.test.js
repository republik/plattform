import test from 'tape'
import React from 'react'

import { renderEmail, Mso } from './email'
import { matchType, matchHeading, matchParagraph } from './utils'

const mdast = {
  'type': 'root',
  'children': [
    {
      'type': 'heading',
      'depth': 1,
      'children': [{
        'type': 'text',
        'value': 'The Titel'
      }]
    },
    {
      'type': 'paragraph',
      'children': [{
        'type': 'text',
        'value': '«A good lead.»'
      }]
    }
  ]
}


const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children }) => (
        <div>
          <Mso gte='15'>
            {`
            <xml>
              <o:officedocumentsettings>
                <o:allowpng />
                <o:pixelsperinch>96</o:pixelsperinch>
              </o:officedocumentsettings>
            </xml>
            `}
          </Mso>
          <Mso>
            {`
            <style>
              table img {
              width:800px !important;
              max-width:800px !important;
              height:auto !important;
              }
              table .body_content img {
              width:640px !important;
              max-width:640px !important;
              height:auto !important;
              }
            </style>
            `}
          </Mso>
          {children}
        </div>
      ),
      rules: [
        {
          matchMdast: matchHeading(1),
          component: ({ children }) => <h1>{children}</h1>
        },
        {
          matchMdast: matchParagraph,
          component: ({ children }) => <p>{children}</p>
        }
      ]
    }
  ]
}

test('render email', assert => {
  let emailHtml
  assert.doesNotThrow(() => {
    emailHtml = renderEmail(mdast, schema, {MissingNode: false})
  })

  assert.notEqual(
    emailHtml.indexOf('<!--[if mso]>'),
    -1,
    'transforms <Mso> into html comment'
  )
  assert.notEqual(
    emailHtml.indexOf('<!--[if gte mso 15]>'),
    -1,
    'transforms <Mso gte=\'15\'> into html comment'
  )

  assert.end()
})
