import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { serifRegular17, serifRegular23 } from '../Typography/styles'

const styles = {
  lead: css({
    ...serifRegular17,
    margin: '0 0 10px 0',
    [mUp]: {
      ...serifRegular23,
      margin: '0 0 20px 0',
    },
  }),
}

const Lead = ({ children }) => {
  return <p {...styles.lead}>{children}</p>
}

Lead.propTypes = {
  children: PropTypes.node,
}

export default Lead
