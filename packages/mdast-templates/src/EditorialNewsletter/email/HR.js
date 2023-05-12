import colors from '@project-r/styleguide/srctheme/colors'
import React from 'react'

const hrStyle = {
  border: 0,
  height: 1,
  color: colors.divider,
  backgroundColor: colors.divider,
  marginTop: 30,
  marginBottom: 30,
}

export default () => <hr style={hrStyle} />
