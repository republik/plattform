import React from 'react'
import { SchemaConfig } from '../../../custom-types'

export const LayoutContainer: React.FC<{
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
