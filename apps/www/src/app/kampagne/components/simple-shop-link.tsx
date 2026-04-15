'use client'

import NativeCta from '@/app/components/paynotes/native-cta'
import { Button } from '@/app/components/ui/button'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@/app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { css } from '@republik/theme/css'

export function ShopLink() {
  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()

  const { isNativeApp } = usePlatformInformation()
  if (isNativeApp) {
    return <NativeCta />
  }

  const allHiddenParams = { ...utmParams }

  return (
    <form
      method='GET'
      action={process.env.NEXT_PUBLIC_SHOP_BASE_URL}
      onSubmit={() => {
        trackEvent({
          action: 'Campaign page: go to shop',
        })
      }}
    >
      {Object.entries(allHiddenParams).map(([k, v]) => (
        <input type='hidden' hidden key={k} name={k} value={v} />
      ))}

      <Button
        size='full'
        type='submit'
        className={css({
          background: 'campaign26Button',
          color: 'white',
        })}
      >
        Angebote anzeigen
      </Button>
    </form>
  )
}
