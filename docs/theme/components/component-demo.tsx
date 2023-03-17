import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const ErrorFallback = () => (
  <div style={{ background: 'hotpink', color: 'white' }}>
    Oh ho! Something happened here.
  </div>
)

export const ComponentDemo = ({
  file,
  Component,
  children,
}: {
  file: string
  Component: () => JSX.Element
  children: ReactNode
}) => (
  <div data-file={file}>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component />
    </ErrorBoundary>

    {children}
  </div>
)
