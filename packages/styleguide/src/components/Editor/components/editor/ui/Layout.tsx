import React from 'react'
import { EditorConfig } from '../../../custom-types'

export const LayoutContainer: React.FC<{ config: EditorConfig }> = ({
  config,
  children,
}) => {
  const Container = config.schema.container
  return Container ? <Container>{children}</Container> : <>{children}</>
}
