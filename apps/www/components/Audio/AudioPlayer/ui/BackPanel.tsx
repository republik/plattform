import { ReactNode } from 'react'
import { css } from 'glamor'
import {
  useBodyScrollLock,
  useColorContext,
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
    paddingBottom: ['32px', 'max(32px, env(safe-area-inset-bottom))'],
    paddingLeft: ['16px', 'max(16px, env(safe-area-inset-left))'],
    paddingRight: ['16px', 'max(16px, env(safe-area-inset-right))'],
    width: '100%',
    boxShadow: '0px -5px 15px -3px rgba(0,0,0,0.1)',
    [mediaQueries.mUp]: {
      width: [290, `calc(100% - ${MARGIN * 2}px)`],
      maxWidth: 380,
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
  useBodyScrollLock(isExpanded)

  return (
    <div {...styles.root}>
      {isExpanded && <div {...styles.backdrop} onClick={onBackdropClick} />}
      <div
        {...styles.wrapper}
        {...colorScheme.set('backgroundColor', 'default')}
      >
        {children}
      </div>
    </div>
  )
}

export default BackPanel
