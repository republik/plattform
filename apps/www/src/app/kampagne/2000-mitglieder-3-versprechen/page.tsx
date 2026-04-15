import { FinalCount } from '@app/app/kampagne/components/handdrawn/final-count'
import { ShopLink } from '@app/app/kampagne/components/simple-shop-link'
import { Video } from '@app/app/kampagne/components/video'
import { Logo } from '@app/components/layout/header/logo'
import { ArticleSection } from '@app/components/ui/section'
import { getMe } from '@app/lib/auth/me'
import { IconClose } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import Link from 'next/link'

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
  '& .status': {
    fontWeight: 500,
    fontSize: 'medium',
    mt: '2',
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
          <h2
            className={css({
              textStyle: 'campaignHeading',
              mt: '12',
              mb: '2',
              md: { mb: '4' },
            })}
          >
            Dank <FinalCount>2000</FinalCount>&nbsp;neuen Mitgliedern lösen wir
            3&nbsp;Versprechen ein.
          </h2>
          <p
            className={css({
              textStyle: 'airy',
              mb: '6',
            })}
          >
            Unser eigentliches Ziel von 2000 haben wir bei weitem übertroffen,
            das ist grossartig! Jetzt machen wir uns an die Arbeit.{' '}
            <br
              className={css({
                display: 'none',
                md: { display: 'block', mb: '2' },
              })}
            />
            Hier sehen Sie, wo wir stehen.
          </p>
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
              <p className='status'>Status: in Arbeit</p>
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
              <p className='status'>Status: in Arbeit</p>
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
              <p className='status'>Status: in Arbeit</p>
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
            Wir freuen uns sehr und danken allen, die uns bei dieser Kampagne
            unterstützt haben!
          </h3>
          {!hasActiveMembership && (
            <>
              <p
                className={css({
                  textStyle: 'airy',
                  mb: '6',
                })}
              >
                Noch nicht an Bord?
              </p>
              <ShopLink />
            </>
          )}
        </ArticleSection>
      </div>
    </>
  )
}
