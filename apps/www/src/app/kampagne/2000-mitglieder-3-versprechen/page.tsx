import { Logo } from '@/app/components/layout/header/logo'
import { ArticleSection } from '@/app/components/ui/section'
import { FinalCount } from '@/app/kampagne/components/handdrawn/final-count'
import { ShopLink } from '@/app/kampagne/components/simple-shop-link'
import { Video } from '@/app/kampagne/components/video'
import { getMe } from '@/app/lib/auth/me'
import { IconClose } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import Link from 'next/link'
import Script from 'next/script'

const journalismPromiseStyle = css({
  pb: 12,
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
          display: 'flex',
          flexDirection: 'row',
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
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              md: { flexDirection: 'row-reverse' },
            })}
          >
            <div>
              <h2
                className={css({
                  textStyle: 'campaignHeading',
                  mt: '12',
                  mb: '2',
                  md: { mb: '4' },
                })}
              >
                Dank <FinalCount>2000</FinalCount>&nbsp;neuen Mitgliedern lösen
                wir 3&nbsp;Versprechen ein.
              </h2>
              <p
                className={css({
                  textStyle: 'airy',
                  mb: '6',
                })}
              >
                Unser eigentliches Ziel von 2000 haben wir bei weitem
                übertroffen, das ist grossartig! Jetzt machen wir uns an die
                Arbeit.{' '}
                <br
                  className={css({
                    display: 'none',
                    md: { display: 'block', mb: '2' },
                  })}
                />
                Hier sehen Sie, wo wir stehen.
              </p>
            </div>
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
        data-theme='light'
        className={css({
          background: 'campaign26Background',
          color: 'campaign26',
        })}
      >
        <ArticleSection
          className={css({
            py: 6,
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
              <p className='status'>
                Status: umgesetzt
                <br />
                <span className={css({ color: 'campaign26.justChocolate' })}>
                  <a href='https://shop.republik.ch/erstwaehlerinnen'>
                    shop.republik.ch/erstwaehlerinnen
                  </a>
                </span>
              </p>
            </JournalismPromise>
            <JournalismPromise count={2}>
              <h3>
                Journalismus für Schulen
              </h3>
              <p>
                Wir stellen die Republik an Schweizer Oberstufenschulen,
                Gymnasien und Berufsschulen kostenlos zur Verfügung.
              </p>
              <p className='status'>
                Status: umgesetzt
                <br />
                <span className={css({ color: 'campaign26.justChocolate' })}>
                  <a href='https://shop.republik.ch/schulen'>
                    shop.republik.ch/schulen
                  </a>
                </span>
              </p>
              <iframe
                title='Schulen mit kostenlosem Zugang'
                aria-label='Choroplethen-Karte'
                id='datawrapper-chart-7GMbw'
                src='https://datawrapper.dwcdn.net/7GMbw/4/'
                scrolling='no'
                frameBorder='0'
                style={{ width: 0, minWidth: '100%', border: 'none' }}
                height='347'
                data-external='1'
              ></iframe>
              <Script
                id='datawrapper-resize-7GMbw'
                strategy='afterInteractive'
                dangerouslySetInnerHTML={{
                  __html: `!function(){"use strict";window.addEventListener("message",function(a){if(void 0!==a.data["datawrapper-height"]){var e=document.querySelectorAll("iframe");for(var t in a.data["datawrapper-height"])for(var r=0;r<e.length;r++)if(e[r].contentWindow===a.source){var i=a.data["datawrapper-height"][t]+"px";e[r].style.height=i}}})}();`,
                }}
              />
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
