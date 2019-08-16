import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import colors from '../../theme/colors'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifRegular16, sansSerifRegular18 } from '../Typography/styles'

const styles = css({
  color: colors.lightText,
  ...sansSerifRegular16,
  lineHeight: '22px',

  [mUp]: {
    ...sansSerifRegular18,
    lineHeight: '24px'
  }
})

const Subject = ({ children }) => {
  const customStyles = css(styles, {
    '&::after': {
      content: !!children.length ? ' ' : undefined
    }
  })
  return <span {...customStyles}>{children}</span>
}

export default Subject

Subject.propTypes = {
  children: PropTypes.node
}
