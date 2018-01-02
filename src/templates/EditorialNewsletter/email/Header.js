import React from 'react'
import colors from '../../../theme/colors'
import { withMeta } from '../../Article/Container'

export default withMeta(({ meta }) => {
  const { slug } = meta
  return (
    <tr>
      <td
        align="center"
        valign="top"
        style={{ borderBottom: `1px solid ${colors.divider}` }}
      >
        <a
          href={`https://www.republik.ch/${slug}`}
          title="Im Web lesen"
          alt="Im Web lesen"
        >
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
            alt="REPUBLIK"
          />
        </a>
      </td>
    </tr>
  )
})
