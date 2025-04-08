import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import { useTranslation } from 'lib/withT'

import { PaynoteSection } from '../ui/containers'
import { Button } from '../ui/button'

export function PaynoteDialog() {
  const { t } = useTranslation()
  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()

  return (
    <PaynoteSection backgroundColor='#FAD5FB'>
      <p>{t('paynotes/dialog/title')}</p>
      <p>{t('paynotes/dialog/description')}</p>
      <form
        method='GET'
        action={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot`}
        onSubmit={() => {
          trackEvent({
            action: `Go to shop`,
          })
        }}
      >
        {Object.entries(utmParams).map(([k, v]) => {
          return <input type='hidden' hidden key={k} name={k} value={v} />
        })}
        <Button type='submit'>{t('paynotes/dialog/cta')}</Button>
      </form>
    </PaynoteSection>
  )
}
