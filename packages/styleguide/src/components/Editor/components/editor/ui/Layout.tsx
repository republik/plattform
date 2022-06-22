import React from 'react'
import { SchemaConfig } from '../../../custom-types'

export const LayoutContainer: React.FC<{ schema: SchemaConfig }> = ({
  schema,
  children,
}) => {
  const Container = schema.container
  return Container ? <Container>{children}</Container> : <>{children}</>
}
