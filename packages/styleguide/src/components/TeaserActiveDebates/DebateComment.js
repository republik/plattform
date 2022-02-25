import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { mUp } from '../../theme/mediaQueries'
import { serifBold28, serifBold32, serifRegular15 } from '../Typography/styles'
import { inQuotes } from '../../lib/inQuotes'
import { useColorContext } from '../Colors/ColorContext'

const styles = {
  base: css({
    display: 'block',
    overflow: 'hidden',
    marginBottom: 10,
    marginTop: 18,
    textDecoration: 'none',
  }),
  preview: css(serifRegular15),
  highlight: css({
    ...serifBold28,
    [mUp]: {
      ...serifBold32,
    },
  }),
}

const DebateComment = React.forwardRef(
  ({ highlight, preview, href, onClick }, ref) => {
    const [colorScheme] = useColorContext()
    return (
      <a
        {...styles.base}
        {...styles[highlight ? 'highlight' : 'preview']}
        {...colorScheme.set('color', 'text')}
        href={href}
        onClick={onClick}
        ref={ref}
      >
        {highlight
          ? inQuotes(highlight)
          : preview && (
              <React.Fragment>
                {preview.string}
                {preview.more && <React.Fragment>&nbsp;…</React.Fragment>}
              </React.Fragment>
            )}
      </a>
    )
  },
)

export default DebateComment

DebateComment.propTypes = {
  highlight: PropTypes.string,
  preview: PropTypes.shape({
    string: PropTypes.string,
    more: PropTypes.bool,
  }),
}
