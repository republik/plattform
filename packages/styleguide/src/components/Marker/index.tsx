import React, { CSSProperties, ReactNode } from 'react'
import { color as d3Color } from 'd3-color'

export type MarkerType =
  | 'yellow'
  | 'pink'
  | 'green'
  | 'blue'
  | 'rotstift'
  | 'drop'

type StyleFn = (isSelected?: boolean) => CSSProperties

type MarkerConfig = {
  color?: string
  pickerColor?: string
  style?: StyleFn
  pickerInnerStyle?: StyleFn
}
export const markersConfig: { [K in MarkerType]: MarkerConfig } = {
  yellow: {
    color: 'rgb(255,255,0)',
  },
  pink: {
    color: 'rgb(255,100,255)',
  },
  green: {
    color: 'rgb(0,255,0)',
  },
  blue: {
    color: 'rgb(0,230,230)',
  },
  rotstift: {
    style: () => ({
      borderBottom: `3px solid`,
      borderBottomColor: 'red',
    }),
    pickerInnerStyle: (isSelected) => ({
      borderRadius: 4,
      position: 'absolute',
      backgroundColor: 'red',
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      boxShadow: isSelected && 'red 0px 0px 2px',
    }),
  },
  drop: {
    style: (isSelected) => ({ opacity: isSelected ? 0.6 : 0.3 }),
    pickerColor: 'rgba(0,0,0,0.1)',
  },
}

export const markerKeys = Object.keys(markersConfig) as MarkerType[]

export const Marker: React.FC<{
  children?: ReactNode
  marker: MarkerType
  isSelected?: boolean
  attributes?: React.ComponentPropsWithoutRef<'span'>
  [x: string]: unknown
}> = ({ marker = 'yellow', isSelected, children, attributes, ...props }) => {
  const { color, style } = markersConfig[marker]
  return (
    <span
      {...props}
      {...attributes}
      style={
        style
          ? style(isSelected)
          : {
              backgroundColor: isSelected
                ? color
                : d3Color(color).copy({ opacity: 0.4 }).toString(),
              paddingTop: '.2em',
              paddingBottom: '.2em',
            }
      }
    >
      {children}
    </span>
  )
}
