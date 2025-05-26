import {
  AccessGrant,
  PastAccessGrantsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'

import { css } from '@republik/theme/css'
import { useTranslation } from 'lib/withT'
import { useState } from 'react'

import { Button } from '../../ui/button'
import { PaynoteSection } from '../../ui/containers'
import { RadioOption } from '../../ui/form'
import { ArrowLink } from '../../ui/links'
import IosCTA from '../ios-cta'

import { ExitSurvey, OpenSurveyButton } from './exit-survey'

type OfferOptions = 'MONTHLY' | 'YEARLY'

const getOffersCopyVersion = (accessGrants: AccessGrant[]): 'a' | 'b' => {
  const trialAccessGrant = accessGrants.find(
    (grant) =>
      grant.campaign.id === process.env.NEXT_PUBLIC_REGWALL_TRIAL_CAMPAIGN_ID,
  )
  if (!trialAccessGrant) return 'b'
  const finishedMoreThanThreeDaysAgo =
    new Date(trialAccessGrant.endAt) <
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  return finishedMoreThanThreeDaysAgo ? 'b' : 'a'
}

function OffersHeader() {
  const { t } = useTranslation()
  const { data, loading } = useQuery(PastAccessGrantsDocument)
  if (loading || !data?.me.accessGrants) return null

  const copyVersion = getOffersCopyVersion(
    data?.me.accessGrants as AccessGrant[],
  )

  return (
    <>
      <h3>{t('paywall/offers/caption')}</h3>
      <h2>
        <span className={css({ fontWeight: 'normal' })}>
          {t(`paywall/${copyVersion}/offers/title/1`)}
        </span>{' '}
        {t(`paywall/${copyVersion}/offers/title/2`)}
      </h2>
    </>
  )
}

function OffersForm({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [option, setOption] = useState<OfferOptions>('YEARLY')
  const [showSurvey, setShowSurvey] = useState(false)
  const { t } = useTranslation()
  const utmParams = getUTMSessionStorage()
  const trackEvent = useTrackEvent()

  return (
    <>
      <PaynoteSection background='colors.background.marketingAlt'>
        <OffersHeader />
        <form
          method='GET'
          action={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot`}
          onSubmit={() => {
            trackEvent({
              action: `Go to ${option} shop`,
            })
          }}
        >
          <input type='hidden' hidden name='promo_code' value='EINSTIEG' />
          {Object.entries(utmParams).map(([k, v]) => {
            return <input type='hidden' hidden key={k} name={k} value={v} />
          })}
          {Object.entries(additionalShopParams).map(([k, v]) => {
            return <input type='hidden' hidden key={k} name={k} value={v} />
          })}
          <div
            className={css({
              display: 'flex',
              gap: '4',
              flexDir: 'column',
              textStyle: 'body',
              alignItems: 'center',
            })}
          >
            <div
              className={css({
                borderTop: '1px solid',
                width: 'full',
                py: '4',
                mt: '6',
                position: 'relative',
              })}
            >
              <span
                className={css({
                  position: 'absolute',
                  top: '-12px',
                  right: '2',
                  backgroundColor: '#688A7C',
                  color: 'white',
                  textTransform: 'uppercase',
                  fontSize: 'xs',
                  fontWeight: 500,
                  px: '4',
                  py: '1',
                  borderRadius: 16,
                })}
              >
                Sie sparen 14&thinsp;%
              </span>
              <RadioOption
                name='product'
                value='YEARLY'
                checked={option === 'YEARLY'}
                onChange={() => setOption('YEARLY')}
              >
                <span
                  className={css({
                    display: 'flex',
                    flexDir: 'column',
                    gap: '1',
                  })}
                >
                  <span className={css({ fontSize: 'xl' })}>
                    <del
                      className={css({
                        color: 'textSoft',
                        mr: '2',
                      })}
                    >
                      <span className={css({ fontSize: 'l' })}>CHF </span>
                      240
                    </del>
                    222.–&thinsp;/&thinsp;{t('paywall/offers/yearly/duration')}
                  </span>
                  <span>{t('paywall/offers/yearly/description')}</span>
                </span>
              </RadioOption>
            </div>

            <div
              className={css({
                borderTop: '1px solid',
                width: 'full',
                py: '4',
                mb: '6',
              })}
            >
              <RadioOption
                name='product'
                value='MONTHLY'
                checked={option === 'MONTHLY'}
                onChange={() => setOption('MONTHLY')}
              >
                <span
                  className={css({
                    display: 'flex',
                    flexDir: 'column',
                    gap: '1',
                  })}
                >
                  <span className={css({ fontSize: 'xl' })}>
                    <del
                      className={css({
                        color: 'textSoft',
                        mr: '2',
                      })}
                    >
                      <span className={css({ fontSize: 'l' })}>CHF </span>
                      22
                    </del>
                    11.–&thinsp;/&thinsp;{t('paywall/offers/monthly/duration')}
                  </span>
                  <span>{t('paywall/offers/monthly/description')}</span>
                </span>
              </RadioOption>
            </div>

            <Button type='submit' size='full'>
              {t('paywall/offers/cta')}
            </Button>
            {!showSurvey && (
              <OpenSurveyButton onClick={() => setShowSurvey(true)} />
            )}
            {!showSurvey && (
              <ArrowLink href={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}`}>
                {t('paywall/offers/all')}
              </ArrowLink>
            )}
          </div>
        </form>
      </PaynoteSection>
      {showSurvey && <ExitSurvey />}
    </>
  )
}

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const { isIOSApp } = usePlatformInformation()
  if (isIOSApp) {
    return (
      <PaynoteSection background='colors.background.marketingAlt'>
        <OffersHeader />
        <IosCTA />
      </PaynoteSection>
    )
  }
  return <OffersForm additionalShopParams={additionalShopParams} />
}
