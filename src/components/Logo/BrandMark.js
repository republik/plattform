import React from 'react'
import {css} from 'glamor'
import SG from '../../theme/env'

const VIEWBOX = SG.BRAND_MARK_VIEWBOX || '0 0 4 4'
const PATH = SG.BRAND_MARK_PATH || 'M0 4 L1 0 L4 4 Z'
const VIEWBOX_ARRAY = VIEWBOX.split(' ').map(d => +d)
const WIDTH = VIEWBOX_ARRAY[2] - VIEWBOX_ARRAY[0]
const HEIGHT = VIEWBOX_ARRAY[3] - VIEWBOX_ARRAY[1]

const styles = {
  container: css({
    position: 'relative',
    height: 0,
    width: '100%',
    paddingBottom: `${HEIGHT / WIDTH * 100}%`
  }),
  svg: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0
  })
}

const R = ({fill}) => (
  <div {...styles.container}>
    <svg {...styles.svg} viewBox={VIEWBOX}>
      <path fill={fill} d={PATH} />
    </svg>
  </div>
)

R.defaultProps = {
  fill: '#000'
}

export default R
