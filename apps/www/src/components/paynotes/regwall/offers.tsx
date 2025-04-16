import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import { css } from '@republik/theme/css'

import { useTranslation } from 'lib/withT'

import { Button } from '../../ui/button'
import { PaynoteSection } from '../../ui/containers'

const Offers = () => {
  const trackEvent = useTrackEvent()
  const { t } = useTranslation()

  return (
    <form
      method='GET'
      action={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot`}
      onSubmit={() => {
        trackEvent({
          action: 'Regwall: Go to shop',
        })
      }}
    >
      {/* TODO: add utms */}
      <PaynoteSection backgroundColor='#DAFF8D'>
        <div className={css({ textStyle: 'airy' })}>
          <p
            dangerouslySetInnerHTML={{
              __html: t('regwall/offers/description'),
            }}
          />
        </div>
        <Button variant='outline' size='full' type='submit'>
          {t('regwall/offers/cta')}
        </Button>
        <p className={css({ textAlign: 'center' })}>
          {t('regwall/offers/cancellable')}
        </p>
      </PaynoteSection>
    </form>
  )
}

export default Offers
