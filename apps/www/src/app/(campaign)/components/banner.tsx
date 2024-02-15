'use client'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
    <div
      data-page-theme='campaign-2024'
      className={css({
        backgroundColor: 'token(colors.campaign2024.red)',
        color: 'token(colors.campaign2024.yellow)',
      })}
    >
      <div
        className={css({
          margin: '0 auto',
          width: '780px',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: '10px 15px 15px 15px',
          md: {
            padding: '10px 40px 15px 40px',
          },
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'row',
            gap: 4,
            alignItems: 'center',
          })}
        >
          <div>
            <svg
              width='auto'
              height='27px'
              viewBox='0 0 34 27'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M27 11.8125V15.1875H33.75V11.8125H27ZM23.625 22.9669C25.245 24.165 27.3544 25.7512 29.025 27C29.7 26.1056 30.375 25.1944 31.05 24.3C29.3794 23.0512 27.27 21.465 25.65 20.25C24.975 21.1612 24.3 22.0725 23.625 22.9669ZM31.05 2.7C30.375 1.80562 29.7 0.894375 29.025 0C27.3544 1.24875 25.245 2.835 23.625 4.05C24.3 4.94438 24.975 5.85563 25.65 6.75C27.27 5.535 29.3794 3.96562 31.05 2.7ZM3.375 8.4375C1.51875 8.4375 0 9.95625 0 11.8125V15.1875C0 17.0438 1.51875 18.5625 3.375 18.5625H5.0625V25.3125H8.4375V18.5625H10.125L18.5625 23.625V3.375L10.125 8.4375H3.375ZM22.7812 13.5C22.7812 11.2556 21.8025 9.23062 20.25 7.84687V19.1362C21.8025 17.7694 22.7812 15.7444 22.7812 13.5Z'
                fill='currentColor'
              />
            </svg>
          </div>
          <p
            className={css({
              textStyle: 'sansSerifMedium',
              flexGrow: 1,
              fontSize: '12px',
              md: {
                fontSize: '14px',
              },
            })}
          >
            Bis zum 31. März suchen wir mit Ihnen zusammen {referralsGoal} neue
            Unterstützer.
            <span
              className={css({
                display: 'none',
                md: {
                  display: 'block',
                },
              })}
            >
              Gemeinsam haben wir schon {currentReferrals || '-'} neue
              Verlegerinnen überzeugt.
            </span>
          </p>
          <Link
            href='/jetzt-einladen'
            className={css({
              backgroundColor: 'token(colors.campaign2024.red)',
              color: 'token(colors.campaign2024.yellow)',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid token(colors.campaign2024.yellow)',
              fontWeight: 500,
              lineHeight: 1.2,
              display: 'block',
              minWidth: 'max-content',
              textDecoration: 'none',
              fontSize: '12px',
              padding: '6px 10px',
              md: {
                fontSize: '14px',
                padding: '10px 20px',
              },
            })}
          >
            Helfen Sie mit
          </Link>
        </div>
        <div>
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
        </div>
      </div>
    </div>
  )
}
