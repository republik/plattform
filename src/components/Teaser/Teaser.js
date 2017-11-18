import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { Format } from './Format'

const styles = {
  main: css({
    borderTop: `1px solid ${colors.text}`,
    paddingTop: '8px',
    margin: '0 0 30px 0',
    [mUp]: {
      margin: '0 0 40px 0',
      paddingTop: '10px'
    }
  })
}

const Teaser = ({ children, type, format, interaction }) => {
  const borderColor = (format && type && colors[type]) || {}
  return (
    <div {...styles.main} style={{ borderColor }}>
      {format && <Format type={type}>{format}</Format>}
      {children}
    </div>
  )
}

Teaser.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['editorial', 'meta', 'social']),
  format: PropTypes.string,
  interaction: PropTypes.bool
}

export default Teaser
