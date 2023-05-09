import { ComponentType, SVGAttributes } from 'react'

/**
 * Type is ment to replace 'IconType' offered by react-icons
 */
export type IconType = ComponentType<
  {
    children?: React.ReactNode
    size?: string | number
    color?: string
    title?: string
  } & SVGAttributes<SVGElement>
>
