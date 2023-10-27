import { ColorContextLocalExtension } from '@project-r/styleguide'
import React from 'react'

function withLocalColorScheme<P = Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>,
  colors: Record<string, unknown>,
) {
  return (props: P) => {
    return (
      <ColorContextLocalExtension localColors={colors}>
        <WrappedComponent {...props} />
      </ColorContextLocalExtension>
    )
  }
}

export default withLocalColorScheme
