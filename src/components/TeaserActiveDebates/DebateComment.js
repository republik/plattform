import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { serifBold28, serifBold32, serifRegular15 } from '../Typography/styles'
import { inQuotes } from '../../lib/inQuotes'

const styles = {
  body: css({
    overflow: 'hidden',
    ...serifRegular15,
    color: colors.text,
    marginBottom: 10,
    marginTop: 18
  }),
  highlight: css({
    overflow: 'hidden',
    ...serifBold28,
    color: colors.text,
    marginBottom: 10,
    marginTop: 18,
    [mUp]: {
      ...serifBold32
    }
  })
}

const DebateComment = ({ highlight, preview }) => {
  return (
    <>
      {!highlight && preview && (
        <div {...styles.body}>
          <React.Fragment>
            {preview.string}
            {preview.more && <React.Fragment>&nbsp;…</React.Fragment>}
          </React.Fragment>
        </div>
      )}
      {highlight && (
        <div {...styles.highlight}>
          {inQuotes(highlight)}
        </div>
      )}
    </>
  )
}

export default DebateComment

DebateComment.propTypes = {
  highlight: PropTypes.string,
  preview: PropTypes.shape({
    string: PropTypes.string,
    more: PropTypes.bool
  })
}
