import React from 'react'
import { cssFor } from 'glamor'
import { Mso } from '@republik/mdast-react-render/email'
import Header from './Header'
import SG from '../../../../theme/env'
import { Editorial, Interaction } from '../../../../components/Typography'
import { VariableContext } from '../../../../components/Variables'
import Footer from './Footer'

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
