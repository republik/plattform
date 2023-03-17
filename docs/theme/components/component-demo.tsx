import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const ErrorFallback = () => (
  <div style={{ background: 'hotpink', color: 'white' }}>
    Oh ho! Something happened here.
  </div>
)

export const ComponentDemo = ({
  children,
  code,
}: {
  children: ReactNode
  code?: string
}) => (
  <div data-name='CODEDEMO'>
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  </div>
)
