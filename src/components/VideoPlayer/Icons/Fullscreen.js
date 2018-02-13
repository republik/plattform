import React, { Fragment } from 'react'
import Fullscreen from 'react-icons/lib/md/fullscreen'
import FullscreenExit from 'react-icons/lib/md/fullscreen-exit'

const Icon = ({ size, fill, off }) => (
  <Fragment>
    {off ? (
      <Fullscreen
        size={size}
        height={size}
        fill={fill}
        style={{ verticalAlign: 'inherit' }}
      />
    ) : (
      <FullscreenExit
        size={size}
        height={size}
        fill={fill}
        style={{ verticalAlign: 'inherit' }}
      />
    )}
  </Fragment>
)

Icon.defaultProps = {
  size: 24,
  fill: '#fff',
  off: true
}

export default Icon
