import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { serifRegular16, serifRegular18 } from '../Typography/styles'

const styles = css({
  ...serifRegular16,
  margin: '0 0 10px 0',
  lineHeight: '22px',
  [mUp]: {
    ...serifRegular18,
    lineHeight: '24px'
  }
})

const Body = ({ children }) => {
  return <div {...styles}>{children}</div>
}

Body.propTypes = {
  children: PropTypes.node
}

export default Body
