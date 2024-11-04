import { useMemo } from 'react'
import { css } from 'glamor'

import { useColorContext, mediaQueries, zIndex } from '@project-r/styleguide'
import { useInNativeApp } from '../../lib/withInNativeApp'

import Portal from 'components/Portal'

const MARGIN = 15

const styles = {
  container: css({
    position: 'fixed',
    right: 0,
    transition: 'opacity ease-out 0.3s',
    margin: `0 ${MARGIN}px`,
    [mediaQueries.mUp]: {
      right: MARGIN,
    },
  }),
  wide: css({
    width: [290, `calc(100% - ${MARGIN * 2}px)`],
    maxWidth: 380,
  }),
}

const BottomPanel = ({
  children,
  visible,
  offset = 0,
  wide = false,
  foreground = false,
}) => {
  const [colorScheme] = useColorContext()
  const { inIOSVersion, inNativeApp } = useInNativeApp()

  const bottomRule = useMemo(
    () =>
      css({
        bottom: [
          offset,
          `calc(${offset}px + env(safe-area-inset-bottom) + 15px)`,
        ],
      }),
    [offset],
  )

  return (
    <Portal selector='bottomPortal' show>
      <div
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? undefined : 'none',
          zIndex: foreground ? zIndex.foreground : zIndex.callout,
        }}
        {...bottomRule}
        {...colorScheme.set('backgroundColor', 'overlay')}
        {...colorScheme.set('boxShadow', 'overlayShadow')}
        {...styles.container}
        {...(wide && styles.wide)}
      >
        {children}
      </div>
    </Portal>
  )
}

export default BottomPanel
