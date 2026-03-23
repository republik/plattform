import logo from '@republik/theme/logo.json'
import React from 'react'

const VIEWBOX = logo.LOGO_VIEWBOX || '0 0 4 1.5'
const PATH = logo.LOGO_PATH || 'M0 0 L4 0 L4 1.5 L3 0.5 L2 4 L1 0.5 L0 1.5 Z'
const VIEWBOX_ARRAY = VIEWBOX.split(' ').map((d) => +d)
const WIDTH = VIEWBOX_ARRAY[2] - VIEWBOX_ARRAY[0]
const HEIGHT = VIEWBOX_ARRAY[3] - VIEWBOX_ARRAY[1]

const ratio = WIDTH / HEIGHT

type LogoProps = {
  width?: number | string
  height?: number | string
  fill?: string
} & React.SVGProps<SVGSVGElement>

const Logo = (props: LogoProps) => {
  return (
    <svg {...props} width={162} height={24} viewBox={VIEWBOX}>
      <path fill={props.fill || 'var(--color-logo)'} d={PATH} />
    </svg>
  )
}

Logo.ratio = ratio

export default Logo
