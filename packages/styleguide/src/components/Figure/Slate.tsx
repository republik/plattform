import React from 'react'
import { FigureImages } from '../Editor/custom-types'
import { Figure as InnerFigure, FigureImage as InnerFigureImage } from './index'

export const PLACEHOLDER = '/static/placeholder.png'

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
  size: string
  attributes: any
  [x: string]: unknown
}> = ({ children, size, attributes = {}, ...props }) => {
  const { ref, ...attrs } = attributes
  return (
    <InnerFigure {...attrs} size={size} {...props}>
      {children}
    </InnerFigure>
  )
}
