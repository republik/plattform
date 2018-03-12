import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { mUp } from '../../theme/mediaQueries'
import { fontFamilies } from '../../theme/fonts'

const styles = {
  quote: css({
    backgroundColor: '#f7f7f7',
    margin: 0,
    padding: '0 15px 12px 15px',
    fontSize: '15px',
    lineHeight: '24px',
    fontFamily: fontFamilies.sansSerifRegular,
    [mUp]: {
      lineHeight: '30px',
      fontSize: '18px',
      padding: '0 25px 20px 25px',
      '&:first-child': {
        paddingTop: '20px'
      }
    },
    '&:first-child': {
      paddingTop: '12px'
    }
  })
}

const BlockQuoteParagraph = ({ children, attributes }) => {
  return (
    <p
      {...styles.quote}
      {...attributes}
    >
      {children}
    </p>
  )
}

BlockQuoteParagraph.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default BlockQuoteParagraph
