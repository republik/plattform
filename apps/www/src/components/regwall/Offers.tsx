import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import { css } from '@republik/theme/css'

import { Button } from '../ui/button'

const Offers = () => {
  const trackEvent = useTrackEvent()

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
      <div className={css({ backgroundColor: '#DAFF8D' })}>
        <div
          className={css({
            margin: '0 auto',
            maxW: 'narrow',
            padding: '4-6',
            display: 'flex',
            flexDir: 'column',
            gap: '4',
          })}
        >
          <div className={css({ textStyle: 'airy' })}>
            <p>
              <b className={css({ fontWeight: 500 })}>
                Und natürlich freuen wir uns auch über Geld:
              </b>{' '}
              Mit einem Abo unterstützen Sie unabhängigen und werbefreien
              Journalismus.
            </p>
          </div>
          <Button variant='outline' type='submit'>
            Abonnieren ab 22/Monat
          </Button>
          <p className={css({ textAlign: 'center' })}>Jederzeit kündbar</p>
        </div>
      </div>
    </form>
  )
}

export default Offers
