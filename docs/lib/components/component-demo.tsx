import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import styles from './component-demo.module.css'

const ErrorFallback = () => (
  <div style={{ background: 'hotpink', color: 'white' }}>
    Oh ho! Something happened here.
  </div>
)

export const ComponentDemo = ({
  file,
  Component,
  children,
  variant,
}: {
  file: string
  Component: () => JSX.Element
  children: ReactNode
  variant?: 'light' | 'dark'
}) => (
  <div data-file={file}>
    <div className={variant}>
      <div className={styles.demoArea}>
        <div className={styles.demoComponent}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Component />
          </ErrorBoundary>
        </div>
      </div>
    </div>

    <div className={styles.demoCode}>{children}</div>
  </div>
)
