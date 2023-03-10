import { ColorContextProvider } from '@project-r/styleguide'
import { ComponentType } from 'react'

export function withDarkMode<P = unknown>(Component: ComponentType<P>) {
  return function DarkModeComponent(props: P) {
    return (
      <ColorContextProvider colorSchemeKey='dark' root>
        <Component {...props} />
      </ColorContextProvider>
    )
  }
}
