import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { serifBold28, serifBold32, serifRegular15 } from '../Typography/styles'
import { inQuotes } from '../../lib/inQuotes'

const styles = {
  base: css({
    display: 'block',
    overflow: 'hidden',
    color: colors.text,
    marginBottom: 10,
    marginTop: 18,
    textDecoration: 'none'
  }),
  preview: css(serifRegular15),
  highlight: css({
    ...serifBold28,
    [mUp]: {
      ...serifBold32
    }
  })
}

const DebateComment = ({ highlight, preview, href, onClick }) => (
  <a {...styles.base} {...styles[highlight ? 'highlight' : 'preview']} href={href} onClick={onClick}>
    {highlight
      ? inQuotes(highlight)
      : preview && <React.Fragment>
        {preview.string}
        {preview.more && <React.Fragment>&nbsp;…</React.Fragment>}
      </React.Fragment>
    }
  </a>
)

export default DebateComment

DebateComment.propTypes = {
  highlight: PropTypes.string,
  preview: PropTypes.shape({
    string: PropTypes.string,
    more: PropTypes.bool
  })
}
