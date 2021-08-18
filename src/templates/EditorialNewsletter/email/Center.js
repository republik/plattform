import React from 'react'
import { fontFamilies } from '../../../theme/fonts'
import HR from './HR'
import { Mso } from 'mdast-react-render/lib/email'
import colors from '../../../theme/colors'

export default ({ children, meta }) => {
  const { slug, path } = meta

  return (
    <tr>
      <td align='center' valign='top'>
        <Mso>
          {`
      <table cellspacing="0" cellpadding="0" border="0" width="600">
        <tr>
          <td>
        `}
        </Mso>
        <table
          align='center'
          border='0'
          cellPadding='0'
          cellSpacing='0'
          width='100%'
          style={{
            maxWidth: 600,
            color: '#000',
            fontSize: 19,
            fontFamily: fontFamilies.serifRegular
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: 20 }} className='body_content'>
                {children}
              </td>
            </tr>
          </tbody>
        </table>
        <Mso>
          {`
      </td>
    </tr>
  </table>
        `}
        </Mso>
      </td>
    </tr>
  )
}
