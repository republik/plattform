import { ReactNode } from 'react'
import { css } from 'glamor'
import { mediaQueries } from '@project-r/styleguide'

type BackdropProps = {
  children?: ReactNode
  isExpanded?: boolean
  onBackdropClick?: () => void
}

const styles = {
  root: css({}),
  backdrop: css({
    // Inset alone covers the viewport. An explicit 100vw would be wider than
    // that wherever a scrollbar takes up space, which now matters: this used
    // to be hidden on desktop, where scrollbars are.
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    // Desktop shows the expanded player as a small floating panel rather
    // than a full-screen sheet, so dimming the page there would be a change
    // in look. The layer stays, invisible, purely to catch outside clicks.
    [mediaQueries.mUp]: {
      backgroundColor: 'transparent',
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
