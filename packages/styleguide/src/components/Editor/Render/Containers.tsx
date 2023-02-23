import React, { ReactNode } from 'react'
import { SchemaConfig } from '../custom-types'

export const DefaultContainer: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ attributes, children, ...props }) => {
  return (
    <div {...attributes} {...props} style={{ position: 'relative' }}>
      {children}
    </div>
  )
}

export const LayoutContainer: React.FC<{
  children?: ReactNode
  schema: SchemaConfig
  style?: Record<string, unknown>
}> = ({ schema, children, style = {} }) => {
  const Container = schema.container
  return Container ? (
    <Container style={style}>{children}</Container>
  ) : (
    <div style={style}>{children}</div>
  )
}
