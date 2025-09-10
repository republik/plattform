import { CampaignHeroSection } from '@app/app/(campaign)/components/campaign-hero'
import { ContainerNarrow } from '@app/components/container'
import { Logo } from '@app/components/layout/header/logo'
import { Offers } from '@app/app/(campaign)/components/campaign-offers'
import { css } from '@republik/theme/css'
import Link from 'next/link'

export default async function Page() {
  return (
    <>
      <div className={css({ pt: '8' })}>
        <Link href='/' className={css({ textDecoration: 'none' })}>
          <Logo />
        </Link>
      </div>
      <CampaignHeroSection>
        <h1
          className={css({
            px: '4',
          })}
        >
          Uns ist es nicht egal.
        </h1>
        <div
          className={css({
            maxW: 'content.narrow',
            textAlign: 'left',
            textStyle: 'body',
            fontSize: 'xl',
            spaceY: '4',
            px: '4',
            mx: 'auto',
            mt: '16',
            lineHeight: '1.5',
          })}
        >
          <p>
            Es sind chaotische Zeiten. Aber wir wenden uns nicht ab: Unsere
            Journalistinnen und Journalisten schauen für Sie dort hin, wo es
            wichtig ist. Engagiert, sorgfältig und neugierig.
          </p>
          <p>
            Wir sorgen dafür, dass Sie nicht von Desinformation, Lärm und
            Bullshit überrollt werden. Denn nur wer gut informiert ist, kann
            auch etwas tun.
          </p>
          <p>Gemeinsam gegen die Gleichgültigkeit.</p>
        </div>
      </CampaignHeroSection>
      <div
        data-page-theme='campaign-2025'
        data-theme-inverted
        className={css({
          color: 'text',
          background: 'pageBackground',
          py: '8',
          fontSize: 'l',
        })}
      >
        <ContainerNarrow>
          <div
            className={css({
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '4',
            })}
          >
            <h3
              className={css({
                textTransform: 'uppercase',
                fontWeight: 'medium',
              })}
            >
              Nur für kurze Zeit
            </h3>
            <p>Die Republik ab CHF 1.– im ersten Monat.</p>

            <Offers />
          </div>
        </ContainerNarrow>
      </div>
    </>
  )
}
