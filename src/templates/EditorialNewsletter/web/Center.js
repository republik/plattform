import React from 'react'
import { fontFamilies } from '../../../theme/fonts'
import { paragraphStyle } from '../email/Paragraph'

export default ({ children }) => (
  <div style={{ maxWidth: '600px', margin: '0 auto', padding: 20 }}>
    {children}
    <div>
      <a href="https://www.republik.ch/">
        <img
          height="79"
          src="https://assets.project-r.construction/images/logo_republik_newsletter.png"
          style={{
            border: 0,
            width: '180px !important',
            height: '79px !important',
            margin: 0,
            maxWidth: '100% !important'
          }}
          width="180"
          alt=""
        />
      </a>
      <p style={{ ...paragraphStyle, marginTop: 0 }}>
        Republik AG<br />
        Sihlhallenstrasse 1<br />
        8004 Zürich
      </p>
      <hr />
      <p>
        <a
          href="*|UNSUB|*"
          style={{
            color: '#000',
            fontFamily: fontFamilies.sansSerifRegular,
            fontSize: '15px'
          }}
        >
          Vom Newsletter abmelden
        </a>
      </p>
    </div>
  </div>
)
