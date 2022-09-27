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
    paddingLeft: ['15px', 'max(15px, env(safe-area-inset-left))'],
    paddingRight: ['15px', 'max(15px, env(safe-area-inset-right))'],
    paddingBottom: ['24px', 'max(24px, env(safe-area-inset-bottom))'],
    width: '100%',
    boxShadow: '0px -5px 15px -3px rgba(0,0,0,0.1)',
    maxHeight: '100vh',
    [mediaQueries.mUp]: {
      width: ['290px', `calc(100% - ${MARGIN * 2}px)`],
      maxWidth: 420,
      marginRight: MARGIN * 2,
      marginBottom: MARGIN * 2,
      padding: 0,
      boxShadow: '0px -5px 15px -3px rgba(0,0,0,0.1)',
      maxHeight: ' min(720px, calc(100vh - 60px))',
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
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
