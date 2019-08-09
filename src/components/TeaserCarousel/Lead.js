import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { serifRegular16, serifRegular18 } from '../Typography/styles'

const styles = {
  lead: css({
    ...serifRegular18,
    margin: '0 0 10px 0',
    lineHeight: '22px',
    [mUp]: {
      ...serifRegular16,
      lineHeight: '22px'
    }
  })
}

const Lead = ({ children }) => {
  return <p {...styles.lead}>{children}</p>
}

Lead.propTypes = {
  children: PropTypes.node
}

export default Lead
