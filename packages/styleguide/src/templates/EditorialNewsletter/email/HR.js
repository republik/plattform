import React from 'react'
import colors from '../../../theme/colors'

const hrStyle = {
  border: 0,
  height: 1,
  color: colors.divider,
  backgroundColor: colors.divider,
  marginTop: 30,
  marginBottom: 30,
}

export default () => <hr style={hrStyle} />
