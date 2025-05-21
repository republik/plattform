import { css } from '@republik/theme/css'

import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'

import { useMe } from 'lib/context/MeContext'
import { useTranslation } from 'lib/withT'
import { timeFormat } from 'lib/utils/format'

import { Button } from '../../ui/button'

import IosCTA from '../ios-cta'

const dayFormat = timeFormat('%e. %B %Y')

function AccountCta() {
  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()
  const { isIOSApp } = usePlatformInformation()
  const { t } = useTranslation()

  if (isIOSApp) return <IosCTA />

  return (
    <form
      method='GET'
      action={process.env.NEXT_PUBLIC_SHOP_BASE_URL}
      onSubmit={() => {
        trackEvent({
          action: `Go to shop`,
        })
      }}
    >
      {Object.entries(utmParams).map(([k, v]) => {
        return <input type='hidden' hidden key={k} name={k} value={v} />
      })}
      <input type='hidden' hidden name='promo_code' value='EINSTIEG' />

      <Button type='submit' size='small'>
        {t('paynotes/account/cta')}
      </Button>
    </form>
  )
}

export function AccountPaynote() {
  const { t } = useTranslation()
  const { me } = useMe()

  if (!me?.accessGrants?.length) return null

  const maxEndAt =
    me.accessGrants.length > 0 &&
    me.accessGrants.reduce(
      (acc, grant) =>
        new Date(grant.endAt) > acc ? new Date(grant.endAt) : acc,
      new Date(),
    )
    console.log(me.accessGrants)
  const maxEndAtString = dayFormat(new Date(maxEndAt))
  const description = (
    t.elements('paynotes/account/description', {
      maxEndAt: maxEndAtString,
    }) as string[]
  ).join('')

  return (
    <div
      data-theme='light'
      className={css({
        background: '#E6F4E2',
        color: 'text',
        textAlign: 'center',
        margin: '0 auto',
        maxW: 'narrow',
      })}
    >
      <div
        className={css({
          padding: '6',
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
          {t('paynotes/account/title')}
        </p>
        <p
          className={css({ lineHeight: 1.4, textStyle: 'body' })}
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
        <AccountCta />
      </div>
    </div>
  )
}
