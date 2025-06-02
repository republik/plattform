import { css } from '@republik/theme/css'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'

import { useTranslation } from 'lib/withT'

import { Button } from '../../ui/button'
import { PaynoteSection } from '../../ui/containers'

import IosCTA from '../ios-cta'

function OffersForm({
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
      <Button variant='outline' size='full' type='submit'>
        {t(`regwall/${variation}/offers/cta`)}
      </Button>
      <p className={css({ textAlign: 'center', pt: '4' })}>
        {t('regwall/offers/cancellable')}
      </p>
    </form>
  )
}

function Offers({
  additionalShopParams = {},
  analyticsProps,
}: {
  additionalShopParams?: Record<string, string>
  analyticsProps: {
    variation: string
  }
}) {
  const { t } = useTranslation()
  const { isIOSApp } = usePlatformInformation()
  const variation = analyticsProps.variation

  return (
    <PaynoteSection background='colors.background.marketingAlt'>
      <div className={css({ textStyle: 'airy' })}>
        <p
          dangerouslySetInnerHTML={{
            __html: t(`regwall/${variation}/offers/description`),
          }}
        />
      </div>
      {isIOSApp ? (
        <IosCTA />
      ) : (
        <OffersForm
          additionalShopParams={additionalShopParams}
          analyticsProps={analyticsProps}
        />
      )}
    </PaynoteSection>
  )
}

export default Offers
