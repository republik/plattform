import React from 'react'

import { Mso } from '../email'

export default ({children}) => (
  <html>
    <head>
      <meta charSet='UTF-8' />
      <meta httpEquiv='x-ua-compatible' content='IE=edge' />
      <meta name='viewport' content='width=device-width,initial-scale=1' />
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
      <title>*|MC:SUBJECT|*</title>
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
      <style type='text/css' dangerouslySetInnerHTML={{__html: `
        img{
          height:auto !important;
          max-width:100% !important;
          width:100% !important;
        }
      `}} />
    </head>
    <body style={{margin: 0, padding: 0, backgroundColor: '#fff'}}>
      <Mso>
        {`
        <div>
          <table cellspacing="0" cellpadding="0" border="0" width="800">
            <tr>
              <td>
        `}
      </Mso>
      <table border='0' cellPadding='0' cellSpacing='0' width='100%'>
        <tbody>
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
