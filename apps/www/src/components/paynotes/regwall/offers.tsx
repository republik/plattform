import { css } from '@republik/theme/css'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'

import { useTranslation } from 'lib/withT'

import { Button } from '../../ui/button'
import { PaynoteSection } from '../../ui/containers'

import IosCTA from '../ios-cta'

function Offers({
  additionalShopParams = {},
  analyticsProps,
}: {
  additionalShopParams?: Record<string, string>
  analyticsProps: {
    variation: string
  }
}) {
  const trackEvent = useTrackEvent()
  const { t } = useTranslation()

  const utmParams = getUTMSessionStorage()
  const variation = analyticsProps.variation

  const { isIOSApp } = usePlatformInformation()
  if (isIOSApp) {
    return <IosCTA />
  }

  return (
    <form
      method='GET'
      action={process.env.NEXT_PUBLIC_SHOP_BASE_URL}
      onSubmit={() => {
        trackEvent({
          action: 'Regwall: Go to shop',
          ...analyticsProps,
        })
      }}
    >
      {Object.entries(utmParams).map(([k, v]) => {
        return <input type='hidden' hidden key={k} name={k} value={v} />
      })}
      {Object.entries(additionalShopParams).map(([k, v]) => {
        return <input type='hidden' hidden key={k} name={k} value={v} />
      })}
      <PaynoteSection background='colors.background.marketingAlt'>
        <div className={css({ textStyle: 'airy' })}>
          <p
            dangerouslySetInnerHTML={{
              __html: t(`regwall/${variation}/offers/description`),
            }}
          />
        </div>
        <Button variant='outline' size='full' type='submit'>
          {t(`regwall/${variation}/offers/cta`)}
        </Button>
        <p className={css({ textAlign: 'center' })}>
          {t('regwall/offers/cancellable')}
        </p>
      </PaynoteSection>
    </form>
  )
}

export default Offers
