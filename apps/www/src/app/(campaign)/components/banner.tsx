'use client'
import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import { getCampaignMemberBannerText } from '@app/app/(campaign)/constants'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ProgressBar = ({
  currentReferrals,
  referralsGoal,
}: {
  currentReferrals: number
  referralsGoal: number
}) => {
  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <div
        className={css({
          width: '100%',
        })}
      >
        <div
          className={css({
            overflow: 'hidden',
            background: 'token(colors.campaign2024.yellowLight)',
            borderRadius: '2px',
            height: '6px',
            display: 'flex',
            flexGrow: 1,
          })}
        >
          <div
            className={css({
              background: 'token(colors.campaign2024.yellow)',
              animationName: 'progressGrow',
              animationTimingFunction: 'ease-in-out',
              animationDuration: '1000ms',
              animationFillMode: 'forwards',
              animationDelay: '500ms',
            })}
            style={{
              // @ts-expect-error custom var
              '--progress-width': `${
                Math.min(1, currentReferrals / referralsGoal) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

const Button = () => {
  const trackEvent = useTrackEvent()

  return (
    <Link
      href='/jetzt-einladen'
      className={css({
        backgroundColor: 'primary',
        color: 'text.primary',
        cursor: 'pointer',
        borderRadius: '4px',
        border: '1px solid token(colors.primary)',
        fontWeight: 'bold',
        lineHeight: 1.2,
        display: 'block',
        minWidth: 'max-content',
        textDecoration: 'none',
        fontSize: '14px',
        padding: '0.5rem 0.75rem',
        _hover: {
          color: 'primary',
          backgroundColor: 'text.primary',
        },
      })}
      onClick={() =>
        trackEvent({ action: 'linkClicked', name: '/jetzt-einladen' })
      }
    >
      Jetzt einladen
    </Link>
  )
}

export function CampaignBanner({
  currentReferrals,
  referralsGoal,
}: {
  currentReferrals: number
  referralsGoal: number
}) {
  const pathname = usePathname()
  if (
    pathname === '/jetzt-einladen' || // prevent rendering on sender page
    !!pathname.match(/^\/jetzt(\/[A-Za-z0-9-]*(\/angebot)?)?$/) // prevent rendering on receiver page
  ) {
    return null
  }

  return (
    <EventTrackingContext category='CampaignBannerTop'>
      <div
        data-page-theme='campaign-2024'
        data-theme-inverted
        className={css({
          backgroundColor: 'pageBackground',
          color: 'text',
        })}
      >
        <div
          className={css({
            margin: '0 auto',
            width: '775px',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '2',
            padding: '15px',
          })}
        >
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center',
              md: {
                flexDirection: 'row',
              },
            })}
          >
            <CampaignLogo
              variant='red-inverted'
              className={css({
                display: 'block',
                width: 90,
                maxWidth: '100%',
                height: 'auto',
                flexShrink: 0,
              })}
            />
            <div
              className={css({
                textStyle: 'sansSerifRegular',
                flexGrow: 1,
                lineHeight: 1.4,

                fontSize: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3',
              })}
            >
              <div>{getCampaignMemberBannerText(currentReferrals)}</div>

              <ProgressBar
                currentReferrals={currentReferrals}
                referralsGoal={referralsGoal}
              />
            </div>
            <Button />
          </div>
        </div>
      </div>
    </EventTrackingContext>
  )
}
