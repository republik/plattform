'use client'
import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/matomo/event-tracking'
import { css } from '@app/styled-system/css'
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
                (currentReferrals / referralsGoal) * 100
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
      Jetzt mithelfen
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

  if (pathname === '/jetzt-einladen') {
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
            width: '780px',
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
              inverted
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
              <div>
                Bis zum 31. März suchen wir mit Ihnen zusammen {referralsGoal}{' '}
                zusätzliche Verleger und Verlegerinnen.
                {/* <span
              className={css({
                display: 'none',
                md: {
                  display: 'block',
                },
              })}
              >
              Gemeinsam haben wir schon {currentReferrals || '-'} neue
              Verlegerinnen überzeugt.
            </span> */}
              </div>

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
