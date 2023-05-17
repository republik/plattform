import { ComponentType } from 'react'
import { ColorContextProvider, colors } from '@project-r/styleguide'

/**
 * Wraps a component with a forced color-context provider
 * that overrides the color-scheme with the given one.
 * @param component Component to wrap
 * @returns Component with forced color-scheme
 */
function withForcedColorScheme<P>(
  Component: ComponentType<P>,
  forcedColorscheme: 'light' | 'dark',
): ComponentType<P> {
  const ComponentWithColorScheme = (props: P) => (
    <ColorContextProvider
      localColorVariables={colors}
      colorSchemeKey={forcedColorscheme}
    >
      <Component {...props} />
    </ColorContextProvider>
  )

  // ComponentWithColorScheme.displayName = `withForcedColorScheme(${
  //   component.displayName || component || 'Component'
  // })`

  return ComponentWithColorScheme
}

export default withForcedColorScheme
