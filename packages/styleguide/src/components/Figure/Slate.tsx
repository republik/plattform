import React from 'react'
import { FigureImages } from '../Editor/custom-types'
import {
  Figure as InnerFigure,
  FigureImage as InnerFigureImage,
  FigureByline as InnerByline,
} from './index'

export const PLACEHOLDER = '/static/placeholder.png'

export const FigureByline: React.FC<{
  children: any
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  return (
    <InnerByline attributes={attributes} {...props} style={{ marginLeft: 4 }}>
      {children}
    </InnerByline>
  )
}

export const FigureImage: React.FC<{
  images?: FigureImages
  alt?: string
  attributes: any
  [x: string]: unknown
}> = ({ children, images, alt, attributes, ...props }) => {
  return (
    <div {...attributes} {...props}>
      <div contentEditable={false}>
        <InnerFigureImage
          src={images?.default?.url || PLACEHOLDER}
          dark={images?.dark?.url ? { src: images.dark.url } : undefined}
          alt={alt}
        />
      </div>
      {children}
    </div>
  )
}

export const Figure: React.FC<{
  children: any
  size: string
  attributes: any
  [x: string]: unknown
}> = ({ children, size, attributes = {} }) => {
  return (
    <InnerFigure attributes={attributes} size={size}>
      {children}
    </InnerFigure>
  )
}
