import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { CampaignHeroSection } from '@app/app/(campaign)/components/campaign-hero'
import { ContainerNarrow } from '@app/components/container'
import { Logo } from '@app/components/layout/header/logo'
import { Offers } from '@app/app/(campaign)/components/campaign-offers'
import { css } from '@republik/theme/css'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params
  const data = await getInviteeData(params)

  const senderName = data.sender?.firstName
    ? `${data.sender.firstName}${
        data.sender.lastName ? ' ' + data.sender.lastName : ''
      }`
    : 'Uns'

  return {
    title: `${senderName} ist nicht egal, was du von
          der Welt erfährst.`,
  }
}

export default async function Page(props) {
  const params = await props.params
  const data = await getInviteeData(params)

  const { sender } = data

  return (
    <>
      <div className={css({ pt: '8' })}>
        <Link href='/' className={css({ textDecoration: 'none' })}>
          <Logo />
        </Link>
      </div>
      <CampaignHeroSection>
        {sender?.portrait && (
          <Image
            className={css({
              // borderRadius: '4px',
              // borderWidth: '2px',
              // borderColor: 'primary',
              // borderStyle: 'solid',
              // boxShadow: 'sm',
              height: '8rem',
              width: '8rem',
              mb: '16',
              mx: '4',
              lg: {
                mx: 'auto',
              },

              // width: { base: '4.5rem', md: '4rem' },
              // height: { base: '4.5rem', md: '4rem' },
            })}
            alt=''
            src={sender.portrait}
            width={96}
            height={96}
            unoptimized
          />
        )}
        <h1
          className={css({
            px: '4',
            fontSize: '4xl',
            lineHeight: '1.1',
            lg: { fontSize: '8xl' },
          })}
        >
          {sender ? `${sender.firstName}` : 'Uns'} ist nicht egal, was du von
          der Welt erfährst.
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
            Es sind chaotische Zeiten. Aber die Journalistinnen und Journalisten
            der Republik schauen für dich dort hin, wo es wichtig ist.
            Engagiert, sorgfältig und neugierig.
          </p>
          <p>
            Damit du nicht von Desinformation, Lärm und Bullshit überrollt
            wirst. Denn nur wer gut informiert ist, kann auch etwas tun.
          </p>
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
