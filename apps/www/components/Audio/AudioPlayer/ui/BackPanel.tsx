import { ReactNode } from 'react'
import { css } from 'glamor'
import {
  useBodyScrollLock,
  useColorContext,
  useMediaQuery,
  mediaQueries,
} from '@project-r/styleguide'

type BackPanelProps = {
  children?: ReactNode
  isExpanded?: boolean
  onBackdropClick?: () => void
}

const MARGIN = 15

const styles = {
  root: css({
    position: 'fixed',
    zIndex: 100,
  }),
  wrapper: css({
    position: 'fixed',
    bottom: 0,
    right: 0,
    margin: 0,
    display: 'flex',
    paddingBottom: ['24px', 'max(24px, env(safe-area-inset-bottom))'],
    paddingLeft: ['16px', 'max(16px, env(safe-area-inset-left))'],
    paddingRight: ['16px', 'max(16px, env(safe-area-inset-right))'],
    width: '100%',
    boxShadow: '0px -5px 15px -3px rgba(0,0,0,0.1)',
    maxHeight: '100vh',
    [mediaQueries.mUp]: {
      width: ['290px', `calc(100% - ${MARGIN * 2}px)`],
      maxWidth: 380,
      maxHeight: '80vh',
      marginRight: MARGIN,
      marginBottom: MARGIN,
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: 0,
      boxShadow: 'none',
    },
  }),
  backdrop: css({
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: '100vh',
    width: '100vw',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    [mediaQueries.mUp]: {
      display: 'none',
    },
  }),
}

const BackPanel = ({
  children,
  isExpanded,
  onBackdropClick,
}: BackPanelProps) => {
  const [colorScheme] = useColorContext()
  const isDesktop = useMediaQuery(mediaQueries.mUp)
  const [ref] = useBodyScrollLock(isExpanded && !isDesktop)

  return (
    <div {...styles.root}>
      {isExpanded && <div {...styles.backdrop} onClick={onBackdropClick} />}
      <div
        ref={ref}
        {...styles.wrapper}
        {...colorScheme.set('backgroundColor', 'overlay')}
        {...colorScheme.set('boxShadow', 'overlayShadow')}
      >
        {children}
      </div>
    </div>
  )
}

export default BackPanel
