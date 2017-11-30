import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Format } from './Format'
import colors, { colorForKind } from '../../theme/colors'

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

const Teaser = ({ children, kind, format, interaction }) => {
  const borderColor = format && kind && colorForKind(kind)
  return (
    <div {...styles.main} style={{ borderColor }}>
      {format && <Format kind={kind}>{format}</Format>}
      {children}
    </div>
  )
}

Teaser.propTypes = {
  children: PropTypes.node.isRequired,
  kind: PropTypes.oneOf(['editorial', 'meta', 'metaSocial', 'editorialSocial']),
  format: PropTypes.string,
  interaction: PropTypes.bool
}

export default Teaser
