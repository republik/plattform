import { renderEmail, Mso } from '../src/email'
import { matchType, matchHeading, matchParagraph } from '../src/utils'

const mdast = {
  type: 'root',
  children: [
    {
      type: 'heading',
      depth: 1,
      children: [
        {
          type: 'text',
          value: 'The Titel',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '«A good lead.»',
        },
      ],
    },
  ],
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
          <Mso gte={undefined}>
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
          component: ({ children }) => <h1>{children}</h1>,
        },
        {
          matchMdast: matchParagraph,
          component: ({ children }) => <p>{children}</p>,
        },
      ],
    },
  ],
}

describe('email rendering', () => {
  test('render email', () => {
    expect(() => {
      renderEmail(mdast, schema, { MissingNode: false })
    }).not.toThrow()
  })

  test('transforms <Mso> into html comment', () => {
    const emailHtml = renderEmail(mdast, schema, { MissingNode: false })
    expect(emailHtml.indexOf('<!--[if mso]>')).not.toEqual(-1)
  })

  test('transforms <Mso gte="15"> into html comment', () => {
    const emailHtml = renderEmail(mdast, schema, { MissingNode: false })
    expect(emailHtml.indexOf('<!--[if gte mso 15]>')).not.toEqual(-1)
  })
})
