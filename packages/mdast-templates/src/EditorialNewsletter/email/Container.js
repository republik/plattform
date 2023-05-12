import {
  Editorial,
  Interaction,
} from '@project-r/styleguide/srccomponents/Typography'
import { VariableContext } from '@project-r/styleguide/srccomponents/Variables'
import SG from '@project-r/styleguide/srctheme/env'
import { cssFor } from 'glamor'
import { Mso } from 'mdast-react-render/lib/email'
import React from 'react'
import Footer from './Footer'
import Header from './Header'

export default ({ children, attributes = {}, meta, variableContext }) => (
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
      <style
        type='text/css'
        dangerouslySetInnerHTML={{
          __html: `
        ${SG.FONT_FACES}
        ${cssFor(Editorial.fontRule)}
        ${cssFor(Interaction.fontRule)}
      `,
        }}
      />
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
      <table border='0' cellPadding='0' cellSpacing='0' width='100%'>
        <tbody>
          <VariableContext.Provider value={variableContext}>
            <Header meta={meta} />
            {children}
            <Footer meta={meta} />
          </VariableContext.Provider>
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
