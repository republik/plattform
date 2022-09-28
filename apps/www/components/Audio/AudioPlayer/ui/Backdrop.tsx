import { ReactNode } from 'react'
import { css } from 'glamor'
import { mediaQueries } from '@project-r/styleguide'

type BackdropProps = {
  children?: ReactNode
  isExpanded?: boolean
  onBackdropClick?: () => void
}

const styles = {
  root: css({
    position: 'fixed',
    zIndex: 100,
  }),
  backdrop: css({
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: '100vh',
    width: '100vw',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    [mediaQueries.mUp]: {
      display: 'none',
    },
  }),
}

const Backdrop = ({ children, isExpanded, onBackdropClick }: BackdropProps) => (
  <div {...styles.root}>
    {isExpanded && <div {...styles.backdrop} onClick={onBackdropClick} />}
    {children}
  </div>
)

export default Backdrop
