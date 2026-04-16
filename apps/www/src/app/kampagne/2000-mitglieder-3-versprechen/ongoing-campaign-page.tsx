// replace page.tsx with this page for when the campaign is ongoing

import CampaignMembershipsCounter from '@/app/kampagne/components/campaign-memberships-counter'
import { Offers } from '@/app/kampagne/components/campaign-offers'
import { Dank } from '@/app/kampagne/components/handdrawn/dank'
import { Video } from '@/app/kampagne/components/video'
import { getCampaignSuccess } from '@/app/kampagne/get-campaign-success'
import { Logo } from '@/app/components/layout/header/logo'
import { Share } from '@/app/components/share/share'
import { ArticleSection } from '@/app/components/ui/section'
import { getMe } from '@/app/lib/auth/me'
import { IconClose } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import Link from 'next/link'
import { PUBLIC_BASE_URL } from '@/lib/constants'

const journalismPromiseStyle = css({
  pb: 8,
  '& h3': {
    textStyle: 'campaignSubhead',
    mb: 2,
  },
  '& p': {
    textStyle: 'airy',
  },
  '& .pill': {
    display: 'inline-block',
    background: 'campaign26.happyCherry',
    color: 'campaign26.frozenYogurt',
    px: 4,
    py: 1,
    borderRadius: 'full',
    fontSize: 's',
    fontWeight: 500,
    mb: 4,
  },
})

function JournalismPromise({
  count,
  children,
}: {
  count: number
  children: React.ReactNode
}) {
  return (
    <div className={journalismPromiseStyle}>
      <span className='pill'>Versprechen {count} von 3</span>
      {children}
    </div>
  )
}

export default async function OngoingCampaignPage() {
  const { hasActiveMembership } = await getMe()
  const { success } = await getCampaignSuccess()

  return (
    <>
      <div
        data-theme='bright'
        className={css({
          background: 'campaign26Background',
          color: 'campaign26',
        })}
      >
        <ArticleSection
          className={css({
            py: '8',
            md: { pt: '12' },
          })}
        >
          <div className={css({ pb: '12' })} data-theme='dark'>
            <Link
              aria-label='Close'
              className={cx(
                button({ variant: 'link' }),
                css({ position: 'absolute', right: 4, top: 4 }),
              )}
              href='/'
            >
              <IconClose size={32} />
            </Link>
            <Link
              href='/'
              className={css({
                display: 'block',
                textDecoration: 'none',
                cursor: 'pointer',
                pt: 4,
                md: { pt: 0 },
              })}
            >
              <Logo />
            </Link>
          </div>
          <CampaignMembershipsCounter />
          <h2
            className={css({
              textStyle: 'campaignHeading',
              mt: '12',
              mb: '2',
              md: { mb: '4' },
            })}
          >
            <Dank showDank={success}>Mit</Dank> 2000&nbsp;neuen Mitgliedern
            lösen wir 3&nbsp;Versprechen ein.
          </h2>
          {hasActiveMembership && success ? (
            <>
              <p
                className={css({
                  textStyle: 'airy',
                  mb: '6',
                })}
              >
                <span className={css({ fontWeight: 500 })}>
                  Und wir machen weiter!
                </span>
                <br />
                Das vergünstigte Angebot gilt bis zum 14. April. Wie viele neue
                Verleger finden wir?
              </p>
              <Share
                title='2000 neue Mitglieder, 3 Versprechen'
                url={`${PUBLIC_BASE_URL}/kampagne/2000-mitglieder-3-versprechen`}
                emailSubject='2000 neue Mitglieder, 3 Versprechen'
              >
                <span
                  className={cx(
                    button({ size: 'full' }),
                    css({
                      background: 'campaign26Button',
                      color: 'white',
                      mb: 2,
                    }),
                  )}
                >
                  Weitersagen
                </span>
              </Share>
            </>
          ) : hasActiveMembership ? (
            <>
              <p
                className={css({
                  textStyle: 'airy',
                  mb: '6',
                })}
              >
                Mit Ihrer Hilfe erreichen wir unser Ziel: Erzählen Sie Ihren
                Freundinnen und Bekannten bis zum 14.&nbsp;April von unserem
                Angebot!
              </p>
              <Share
                title='2000 neue Mitglieder, 3 Versprechen'
                url={`${PUBLIC_BASE_URL}/kampagne/2000-mitglieder-3-versprechen`}
                emailSubject='2000 neue Mitglieder, 3 Versprechen'
              >
                <span
                  className={cx(
                    button({ size: 'full' }),
                    css({
                      background: 'campaign26Button',
                      color: 'white',
                      mb: 2,
                    }),
                  )}
                >
                  Weitersagen
                </span>
              </Share>
            </>
          ) : success ? (
            <>
              <p
                className={css({
                  textStyle: 'airy',
                  mb: '6',
                })}
              >
                <span className={css({ fontWeight: 500 })}>
                  Aber Sie fehlen noch.{' '}
                </span>
                Profitieren Sie bis zum 14. April von unserem vergünstigten
                Angebot!
              </p>
              <Offers
                additionalShopParams={{
                  rep_ui_component: 'campaign-landing-page',
                }}
              />
              <p
                className={css({
                  textAlign: 'center',
                  mt: '6',
                })}
              >
                Jederzeit kündbar
              </p>
            </>
          ) : (
            <>
              <p
                className={css({
                  textStyle: 'airy',
                  mb: '0',
                  md: { textStyle: 'heavy', mb: '6' },
                })}
              >
                Kommen Sie bis zum 14.&nbsp;April an Bord.
              </p>
              <p
                className={css({
                  textStyle: 'airy',
                  mb: '6',
                })}
              >
                Sie bestimmen, wie viel Sie im ersten Jahr zahlen:
              </p>
              <Offers
                additionalShopParams={{
                  rep_ui_component: 'campaign-landing-page',
                }}
              />
              <p
                className={css({
                  textAlign: 'center',
                  mt: '6',
                })}
              >
                Jederzeit kündbar
              </p>
            </>
          )}
        </ArticleSection>
      </div>
      <div
        data-theme='light'
        className={css({
          background: 'campaign26Background',
          color: 'campaign26',
        })}
      >
        <ArticleSection
          className={css({
            py: 6,
            md: { display: 'grid', gridTemplateColumns: '1fr 1fr' },
          })}
        >
          <div>
            <p
              className={css({
                fontFamily: 'gtAmericaStandard',
                fontWeight: 700,
                fontSize: '2xl',
                color: 'campaign26.justChocolate',
                mb: 6,
              })}
            >
              Was wir umsetzen:
            </p>
            <JournalismPromise count={1}>
              <h3>
                Journalismus für
                <br />
                Erstwählerinnen
              </h3>
              <p>
                Wir verschenken ein Jahr Republik an Menschen, die zum ersten
                Mal abstimmen oder wählen.
              </p>
              <div
                className={css({
                  mt: 6,
                  mb: 3,
                  md: {
                    display: 'none',
                  },
                })}
              >
                <Video />
              </div>
            </JournalismPromise>
            <JournalismPromise count={2}>
              <h3>
                Journalismus für
                <br />
                Schulen
              </h3>
              <p>
                Wir stellen die Republik an Schweizer Oberstufenschulen,
                Gymnasien und Berufsschulen kostenlos zur Verfügung.
              </p>
            </JournalismPromise>
            <JournalismPromise count={3}>
              <h3>
                Journalismus für
                <br />
                Freunde
              </h3>
              <p>
                Wer bis zum 14.&nbsp;April an Bord kommt, darf eine Freundin
                kostenlos für drei Monate neu zur Republik einladen.
              </p>
            </JournalismPromise>
          </div>
          <div
            className={css({
              display: 'none',
              md: {
                display: 'flex',
                alignItems: 'center',
              },
              lg: {
                ml: 20,
                mr: -20,
              },
            })}
          >
            <div
              className={css({
                width: '100%',
              })}
            >
              <Video />
            </div>
          </div>
        </ArticleSection>
      </div>
      {!hasActiveMembership && (
        <div
          data-theme='dark'
          className={css({
            background: 'campaign26Background',
            color: 'campaign26',
          })}
        >
          <ArticleSection
            className={css({
              py: '8',
              md: { pt: '12' },
            })}
          >
            {success ? (
              <h3
                className={css({
                  textStyle: 'campaignSubhead',
                  color: 'campaign26.happyCherry',
                  mb: '6',
                })}
              >
                Diese 3&nbsp;Versprechen werden wir einlösen. Die Frage ist
                bloss: Sind Sie dabei?
              </h3>
            ) : (
              <h3
                className={css({
                  textStyle: 'campaignSubhead',
                  color: 'campaign26.happyCherry',
                  mb: '6',
                })}
              >
                Diese 3&nbsp;Versprechen lösen wir ein, wenn wir bis zum
                14.&nbsp;April unser Ziel von 2000&nbsp;neuen Mitgliedern
                erreichen. Machen Sie mit?
              </h3>
            )}
            <p
              className={css({
                textStyle: 'airy',
                mb: '6',
              })}
            >
              Ein Jahr Republik zum Preis Ihrer Wahl:
            </p>
            <Offers
              additionalShopParams={{
                rep_ui_component: 'campaign-landing-page',
              }}
            />
            <p
              className={css({
                textAlign: 'center',
                mt: '6',
              })}
            >
              Jederzeit kündbar
            </p>
          </ArticleSection>
        </div>
      )}
    </>
  )
}
