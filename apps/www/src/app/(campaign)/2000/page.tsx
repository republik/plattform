import CampaignMembershipsCounter from '@app/app/(campaign)/components/campaign-memberships-counter'
import { Offers } from '@app/app/(campaign)/components/campaign-offers'
import { Logo } from '@app/components/layout/header/logo'
import { Share } from '@app/components/share/share'
import { Button } from '@app/components/ui/button'
import { ArticleSection } from '@app/components/ui/section'
import { getMe } from '@app/lib/auth/me'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { PUBLIC_BASE_URL } from '../../../../lib/constants'

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

export default async function Page() {
  const { hasActiveMembership } = await getMe()

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
            <Link href='/' className={css({ textDecoration: 'none' })}>
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
            Mit 2000 neuen Mitgliedern lösen wir 3 Versprechen ein.
          </h2>
          {hasActiveMembership ? (
            <>
              <p
                className={css({
                  textStyle: 'airy',
                  mb: '6',
                })}
              >
                Mit Ihrer Hilfe erreichen wir unser Ziel: Erzählen Sie Ihren
                Freundinnen und Bekannten bis zum 14. April von unserem Angebot!
              </p>
              <Share
                title='2000 neue Mitglieder, 3 Versprechen'
                url={`${PUBLIC_BASE_URL}/2000`}
                emailSubject='2000 neue Mitglieder, 3 Versprechen'
              >
                <Button
                  size='full'
                  className={css({
                    background: 'campaign26Button',
                    color: 'white',
                    mb: 2,
                  })}
                >
                  Weitersagen
                </Button>
              </Share>
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
                Kommen Sie bis zum 14. April an Bord.
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
                  rep_ui_component: 'campaign-paywall',
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
                Wir verschenken ein Jahresabo der Republik an Menschen, die zum
                ersten Mal abstimmen oder wählen.
              </p>
              <div
                className={css({
                  mt: 6,
                  mb: 3,
                  '& iframe': {
                    aspectRatio: '9/16',
                    width: '100%',
                    height: 'auto',
                  },
                  md: {
                    display: 'none',
                  },
                })}
              >
                <iframe
                  src='https://player.vimeo.com/video/613729649'
                  frameBorder='0'
                ></iframe>
              </div>
            </JournalismPromise>
            <JournalismPromise count={2}>
              <h3>
                Journalismus für
                <br />
                Schulen
              </h3>
              <p>
                Wir stellen die Republik an Schweizer Schulen der Sekundarstufe
                I und II kostenlos zur Verfügung.
              </p>
            </JournalismPromise>
            <JournalismPromise count={3}>
              <h3>
                Journalismus für
                <br />
                Freunde
              </h3>
              <p>
                Wer bis zum 14. April an Bord kommt, darf eine Freundin
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
                '& iframe': {
                  aspectRatio: '9/16',
                  width: '100%',
                  height: 'auto',
                },
              })}
            >
              <iframe
                src='https://player.vimeo.com/video/613729649'
                frameBorder='0'
              ></iframe>
            </div>
          </div>
        </ArticleSection>
      </div>
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
          <h3
            className={css({
              textStyle: 'campaignSubhead',
              color: 'campaign26.happyCherry',
              mb: '6',
            })}
          >
            Diese 3 Versprechen lösen wir ein, wenn wir bis zum 14. April unser
            Ziel von 2000 neuen Mitgliedern erreichen. Machen Sie mit?
          </h3>
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
              rep_ui_component: 'campaign-paywall',
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
    </>
  )
}
