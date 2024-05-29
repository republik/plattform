'use client'
import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import { EventTrackingContext } from '@app/lib/matomo/event-tracking'
import { css } from '@republik/theme/css'
import { useEffect, useState } from 'react'

type Variant = {
  utm: string
  slogan: string
  benefits: string[]
  upsell: string
}
const TEXT_VARIANTS: Variant[] = [
  {
    utm: 'utm_medium=website&utm_source=direct&utm_campaign=einsteigertest&utm_content=v1',
    slogan:
      'Wir gehören niemandem, aber jeder unserer Leserinnen ein bisschen.',
    benefits: [
      'Alles, was Sie wissen müssen, und nicht mehr – bis zu drei Beiträge pro Tag zum Lesen und zum Hören.',
      'Werbefrei, unabhängig, finanziert von über 26’000 Abonnentinnen.',
      'Die beste und höflichste Onlinecommunity der Schweiz, in der sich Republik-Autorinnen und Abonnenten täglich austauschen.',
    ],
    upsell: 'Für Wagemutige: die Republik-Jahresmitgliedschaft',
  },
  {
    utm: 'utm_medium=website&utm_source=direct&utm_campaign=einsteigertest&utm_content=v2',
    slogan: 'Was Sie mit einem Abo bekommen',
    benefits: [
      'Bis zu drei Artikel pro Tag zum Lesen und zum Hören – werbefrei, unabhängig, finanziert von über 26’000 Abonnentinnen.',
      'Die beste und höflichste Onlinecommunity der Schweiz, in der sich Republik-Autorinnen und Abonnentinnen täglich austauschen.',
      'Jeden Donnerstag das Wichtigste in Kürze zur Schweizer Politik und jeden Freitag das Wichtigste aus der ganzen Welt.',
    ],
    upsell: 'Oder sparen Sie mit einem Jahresabo',
  },
  {
    utm: 'utm_medium=website&utm_source=direct&utm_campaign=einsteigertest&utm_content=v3',
    slogan: 'Über 26’000 sind bereits dabei',
    benefits: [
      'Bis zu drei Artikel pro Tag zum Lesen und zum Hören – werbefrei, unabhängig, finanziert von über 26’000 Abonnentinnen.',
      'Die beste und höflichste Onlinecommunity der Schweiz, in der sich Republik-Autorinnen und Abonnentinnen täglich austauschen.',
      'Jeden Donnerstag das Wichtigste in Kürze zur Schweizer Politik und jeden Freitag das Wichtigste aus der ganzen Welt.',
    ],
    upsell: 'Oder sparen Sie mit einem Jahresabo',
  },
]

const Button = ({ utm }: { utm: string }) => {
  return (
    <a
      href={`/angebote?package=MONTHLY_ABO&coupon=EINSTIEG24&${utm}`}
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
    >
      Abonnieren
    </a>
  )
}

export function TrialPaynote({
  variant = 'regular',
}: {
  variant?: 'mini' | 'regular'
}) {
  // Choose random variant
  const [textVariant, setTextVariant] = useState<Variant | undefined>(undefined)
  useEffect(() => {
    if (!textVariant) {
      setTextVariant(
        TEXT_VARIANTS[Math.floor(Math.random() * TEXT_VARIANTS.length)],
      )
    }
  }, [textVariant])

  if (!textVariant) {
    return
  }

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
              2.– für 30 Tage
            </p>

            <Button utm={textVariant.utm} />

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
                danach 22.– pro Monat
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
                  {textVariant.slogan}
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
                  {textVariant.benefits.map((benefit) => {
                    return <li key={benefit}>{benefit}</li>
                  })}
                </ul>

                <p className={css({ textAlign: 'center' })}>
                  <a
                    className={css({
                      color: '#757575',
                      fontSize: 's',
                      textDecoration: 'underline',
                    })}
                    href={`/angebote?package=ABO&${textVariant.utm}`}
                  >
                    {textVariant.upsell}
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </EventTrackingContext>
  )
}
