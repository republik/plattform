'use client'

import useNativeAppEvent from '@app/lib/hooks/useNativeAppEvent'

export function NAColorSchemeSyncHandler() {
  useNativeAppEvent('osColorScheme', (content) => {
    // if (content.type === 'osColorScheme') {
    //     if (content.value) {
    //       setOSColorScheme(content.value)
    //     }
  })

  return null
}
