import React from 'react'
import { css } from 'glamor'
import { Mso } from 'mdast-react-render/lib/email'
import Header from './Header'

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
        @font-face{font-family:'Rubis-Regular';src:url(https://assets.republik.ch/fonts/rubis-regular.eot);src:url('https://assets.republik.ch/fonts/rubis-regular.eot?#iefix') format('embedded-opentype'),url(https://assets.republik.ch/fonts/rubis-regular.woff2) format('woff2'),url(https://assets.republik.ch/fonts/rubis-regular.woff) format('woff'),url(https://assets.republik.ch/fonts/rubis-regular.ttf) format('truetype')}@font-face{font-family:'Rubis-Bold';src:url(https://assets.republik.ch/fonts/rubis-bold.eot);src:url('https://assets.republik.ch/fonts/rubis-bold.eot?#iefix') format('embedded-opentype'),url(https://assets.republik.ch/fonts/rubis-bold.woff2) format('woff2'),url(https://assets.republik.ch/fonts/rubis-bold.woff) format('woff'),url(https://assets.republik.ch/fonts/rubis-bold.ttf) format('truetype')}@font-face{font-family:'GT-America-Standard-Regular';src:url(https://assets.republik.ch/fonts/gt-america-standard-regular.eot);src:url('https://assets.republik.ch/fonts/gt-america-standard-regular.eot?#iefix') format('embedded-opentype'),url(https://assets.republik.ch/fonts/gt-america-standard-regular.woff) format('woff'),url(https://assets.republik.ch/fonts/gt-america-standard-regular.ttf) format('truetype')}@font-face{font-family:'GT-America-Standard-Medium';src:url(https://assets.republik.ch/fonts/gt-america-standard-medium.eot);src:url('https://assets.republik.ch/fonts/gt-america-standard-medium.eot?#iefix') format('embedded-opentype'),url(https://assets.republik.ch/fonts/gt-america-standard-medium.woff) format('woff'),url(https://assets.republik.ch/fonts/gt-america-standard-medium.ttf) format('truetype')}@font-face{font-family:'RepublikSerif-Black';src:url(https://assets.republik.ch/fonts/republik-serif-black-001.eot);src:url('https://assets.republik.ch/fonts/republik-serif-black-001.eot?#iefix') format('embedded-opentype'),url(https://assets.republik.ch/fonts/republik-serif-black-001.woff2) format('woff2'),url(https://assets.republik.ch/fonts/republik-serif-black-001.woff) format('woff'),url(https://assets.republik.ch/fonts/republik-serif-black-001.ttf) format('truetype')}
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
