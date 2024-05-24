'use client'
import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/matomo/event-tracking'
import { css } from '@republik/theme/css'
import Link from 'next/link'

const Button = () => {
  const trackEvent = useTrackEvent()

  return (
    <Link
      href='/angebote?package=MONTHLY_ABO&coupon=EINSTIEG24&utm_campaign=TEST'
      className={css({
        backgroundColor: 'primary',
        color: 'text.primary',
        cursor: 'pointer',
        borderRadius: '4px',
        border: '2px solid token(colors.primary)',
        fontWeight: 'medium',
        lineHeight: 1.2,
        display: 'block',
        minWidth: 'max-content',
        textDecoration: 'none',
        fontSize: 'xl',
        padding: '0.75rem 1rem',
        _hover: {
          color: 'primary',
          backgroundColor: 'text.primary',
        },
      })}
      onClick={() => trackEvent({ action: 'linkClicked', name: '/angebote' })}
    >
      Abonnieren
    </Link>
  )
}

export function TrialPaynote({
  variant = 'regular',
}: {
  variant?: 'mini' | 'regular'
}) {
  return (
    <EventTrackingContext category='TrialPaynote'>
      <div
        data-hide-if-active-membership='true'
        data-page-theme='campaign-2024'
        className={css({
          textStyle: 'body',
          color: 'text.black',
          lineHeight: 1.5,
        })}
      >
        <div
          className={css({
            margin: '0 auto',
            width: '695px',
            maxWidth: '100%',
            p: '15px',
          })}
        >
          <div
            className={css({
              backgroundColor: 'pageBackground',

              display: 'flex',
              flexDirection: 'column',
              gap: '8',
              padding: '6',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'overlay',
              borderRadius: 4,
              my: '6',
              md: {
                padding: '12',
              },
            })}
            style={{ margin: variant === 'mini' ? 0 : undefined }}
          >
            <CampaignLogo
              className={css({
                display: 'block',
                width: 180,
                maxWidth: '100%',
                height: 'auto',
                flexShrink: 0,
              })}
              variant='black'
            />

            <p
              className={css({
                textStyle: 'h2Sans',
                fontWeight: 'bold',
                fontSize: '2xl',
              })}
            >
              CHF 2 für 30 Tage
            </p>

            <Button />

            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              })}
            >
              <p
                className={css({
                  fontWeight: 'medium',
                  fontSize: 'm',
                  // mb: '2',
                })}
              >
                danach CHF 22 pro Monat
              </p>
              <p>jederzeit kündbar</p>
            </div>

            {variant === 'regular' && (
              <>
                <hr
                  className={css({
                    width: 'full',
                    borderTopWidth: '1px',
                    borderTopColor: 'rgba(40,40,40,0.2)',
                  })}
                />

                <h2
                  className={css({
                    textStyle: 'h2Sans',
                    fontWeight: 'bold',
                    fontSize: 'xl',
                    textAlign: 'center',
                  })}
                >
                  Nur unsere Leserinnen können uns kaufen
                </h2>

                <ul
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6',
                    '& > li': {
                      listStyleType: 'none',
                      pl: '6',
                      position: 'relative',
                      '&::before': {
                        content: '"–"',
                        position: 'absolute',
                        left: '0',
                      },
                    },
                  })}
                >
                  <li>
                    Unterstützen sie ein zu 100% unabhängiges,
                    leserinnenfinanziertes Medium: Komplett Werbefrei
                  </li>
                  <li>
                    Diskutieren Sie in der besten Online-Community der Schweiz
                  </li>
                  <li>
                    Briefing aus Bern mit den wichtigsten Themen zur Schweizer
                    Politik und einem Wochenbriefing zum Weltgeschehen
                  </li>
                </ul>

                <p className={css({ textAlign: 'center' })}>
                  <Link
                    className={css({
                      color: '#757575',
                      fontSize: 's',
                      textDecoration: 'underline',
                    })}
                    href='/angebote?package=ABO'
                  >
                    oder sparen Sie 10% mit der Jahresmitgliedschaft für 240.-
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </EventTrackingContext>
  )
}
