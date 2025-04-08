import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import { useTranslation } from 'lib/withT'

import { PaynoteSection } from '../ui/containers'
import { Button } from '../ui/button'
import { css } from '@republik/theme/css'

export function DialogPaynote() {
  const { t } = useTranslation()
  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()

  return (
    <div
      data-theme='light'
      style={{
        // @ts-expect-error css vars
        '--bg': '#FAD5FB',
      }}
      className={css({
        background: 'var(--bg)',
        color: 'text',
        textAlign: 'center',
        margin: '0 auto',
        maxW: 'narrow',
      })}
    >
      <div
        className={css({
          padding: '4',
          display: 'flex',
          flexDir: 'column',
          gap: '4',
          '& h2': {
            textStyle: 'h2Sans',
          },
          '& h3': {
            textTransform: 'uppercase',
            fontWeight: 500,
          },
          '& b': {
            fontWeight: 500,
          },
        })}
      >
        <p className={css({ textStyle: 'airy', fontWeight: 500 })}>
          {t('paynotes/dialog/title')}
        </p>
        <p className={css({ lineHeight: 1.4, textStyle: 'body' })}>
          {t('paynotes/dialog/description')}
        </p>
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
          <Button type='submit' size='small'>
            {t('paynotes/dialog/cta')}
          </Button>
        </form>
      </div>
    </div>
  )
}
