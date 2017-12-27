import React from 'react'
import { css } from 'glamor'
import { Mso } from 'mdast-react-render/lib/email'
import Header from './Header'
import SG from '../../../theme/env'

const styles = {
  container: {
    fontFamily: 'serif',
    fontSize: 18,
    color: '#000',
    WebkitFontSmoothing: 'antialiased',
    backgroundColor: '#fff',
    width: '100%'
  }
}

export default ({ children, attributes = {} }) => (
  <div
    {...css(styles.container)}
    {...attributes}
    style={{ margin: 0, padding: 0, backgroundColor: '#fff' }}
  >
    <style
      type="text/css"
      dangerouslySetInnerHTML={{
        __html: `
        ${SG.FONT_FACES}
        mso{
          display: none;
        }
      `
      }}
    />
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
        <Header />
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
  </div>
)
