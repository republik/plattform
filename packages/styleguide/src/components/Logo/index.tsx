import React from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/useColorContext'
import logo from '@republik/theme/logo.json'

const VIEWBOX = logo.LOGO_VIEWBOX || '0 0 4 1.5'
const GRADIENT = logo.LOGO_GRADIENT
const PATH = logo.LOGO_PATH || 'M0 0 L4 0 L4 1.5 L3 0.5 L2 4 L1 0.5 L0 1.5 Z'
const VIEWBOX_ARRAY = VIEWBOX.split(' ').map((d) => +d)
const WIDTH = VIEWBOX_ARRAY[2] - VIEWBOX_ARRAY[0]
const HEIGHT = VIEWBOX_ARRAY[3] - VIEWBOX_ARRAY[1]

const ratio = WIDTH / HEIGHT

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

type LogoProps = {
  width?: number | string
  height?: number | string
  fill: string
} & React.SVGProps<SVGSVGElement>

const LogoSvg = ({ width, height, fill, ...props }: LogoProps) => {
  const [colorScheme] = useColorContext()
  return (
    <svg
      {...colorScheme.set('fill', 'logo')}
      {...props}
      width={width}
      height={height}
      viewBox={VIEWBOX}
    >
      {GRADIENT && <defs dangerouslySetInnerHTML={{ __html: GRADIENT }} />}
      <path fill={GRADIENT ? 'url(#logo-gradient)' : fill} d={PATH} />
    </svg>
  )
}

const Logo = (props: LogoProps) => {
  let width
  let height
  if (props.width) {
    width = props.width
    height = width / ratio
  } else if (props.height) {
    height = props.height
    width = height * ratio
  } else {
    return (
      <div {...styles.container}>
        <LogoSvg {...styles.svg} width='100%' fill={props.fill} />
      </div>
    )
  }

  return <LogoSvg width={width} height={height} fill={props.fill} />
}

Logo.ratio = ratio

export default Logo
