import React from 'react'
import { Mso } from 'mdast-react-render/lib/email'
import Header from './Header'
import SG from '../../../theme/env'

export default ({ children, attributes = {}, meta }) => (
  <html>
    <head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="x-ua-compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <Mso gte="15">
        {`
        <xml>
          <o:officedocumentsettings>
            <o:allowpng />
            <o:pixelsperinch>96</o:pixelsperinch>
          </o:officedocumentsettings>
        </xml>
        `}
      </Mso>
      <title>*|MC:SUBJECT|*</title>
      <style
        type="text/css"
        dangerouslySetInnerHTML={{
          __html: `
        ${SG.FONT_FACES}
      `
        }}
      />
      <Mso>
        {`
        <style>
          strong { font-weight:bold !important; }
        </style>
        `}
      </Mso>
    </head>
    <body style={{ margin: 0, padding: 0, backgroundColor: '#fff' }}>
      <Mso>
        {`
    <div>
      <table cellspacing="0" cellpadding="0" border="0" width="800">
        <tr>
          <td>
    `}
      </Mso>
      <table border="0" cellPadding="0" cellSpacing="0" width="100%">
        <tbody>
          <Header meta={meta} />
          {children}
        </tbody>
      </table>
      <Mso>
        {`
          </td>
        </tr>
      </table>
    </div>
    `}
      </Mso>
    </body>
  </html>
)
