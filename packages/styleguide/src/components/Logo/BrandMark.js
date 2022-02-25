import React from 'react'
import { css } from 'glamor'
import SG from '../../theme/env'
import { useColorContext } from '../Colors/ColorContext'

const VIEWBOX = SG.BRAND_MARK_VIEWBOX || '0 0 4 4'
const PATH = SG.BRAND_MARK_PATH || 'M0 4 L1 0 L4 4 Z'
const VIEWBOX_ARRAY = VIEWBOX.split(' ').map((d) => +d)
const WIDTH = VIEWBOX_ARRAY[2] - VIEWBOX_ARRAY[0]
const HEIGHT = VIEWBOX_ARRAY[3] - VIEWBOX_ARRAY[1]

const ppViewBox = [
  VIEWBOX_ARRAY[0] - WIDTH * 0.22,
  VIEWBOX_ARRAY[1] - HEIGHT * 0.22,
  WIDTH + WIDTH * 0.44,
  HEIGHT + HEIGHT * 0.44,
]
export const DEFAULT_PROFILE_PICTURE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ppViewBox.join(
    ' ',
  )}"><rect x="${ppViewBox[0]}" y="${ppViewBox[1]}" width="${
    ppViewBox[2]
  }" height="${
    ppViewBox[3]
  }" fill="#E1E7E5" /><path fill="#fff" d="${PATH}" /></svg>`,
)}`

const styles = {
  container: css({
    position: 'relative',
    height: 0,
    width: '100%',
    paddingBottom: `${(HEIGHT / WIDTH) * 100}%`,
  }),
  svg: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
  }),
}

const R = ({ fill }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.container}>
      <svg
        {...styles.svg}
        viewBox={VIEWBOX}
        {...colorScheme.set('fill', fill || 'logo')}
      >
        <path d={PATH} />
      </svg>
    </div>
  )
}

export default R
