import { getSenderData } from '@app/app/(campaign)/campaign-data'
import { CampaignHeroSection } from '@app/app/(campaign)/components/campaign-hero'
import { ShareLink } from '@app/app/(campaign)/jetzt-einladen/share-components'
import Container from '@app/components/container'
import { css } from '@republik/theme/css'
import { PUBLIC_BASE_URL } from 'lib/constants'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Laden Sie jemanden ein',
}

export default async function Page() {
  const { me, campaign } = await getSenderData()

  // The version with referral code for private profile users:
  // const url = `${PUBLIC_BASE_URL}/jetzt/${
  //   me?.hasPublicProfile ? me.username : me?.referralCode
  // }`

  // The version with generic URL (no referral code) except for public profile users:
  const url = `${PUBLIC_BASE_URL}/jetzt/${
    me?.hasPublicProfile ? me.username : ''
  }`

  // Redirect to campaign thank you page
  if (!campaign?.isActive) {
    return redirect('/jetzt-danke')
  }

  if (!me) {
    return redirect('/anmelden')
  }

  return (
    <>
      <CampaignHeroSection>
        <h1
          className={css({
            px: '4',
          })}
        >
          Uns ist es nicht egal.
        </h1>
      </CampaignHeroSection>
      <div
        data-page-theme='campaign-2025'
        data-theme-inverted
        className={css({
          color: 'text',
          background: 'pageBackground',
        })}
      >
        <Container>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '8',
              py: '8-16',
              fontSize: 'l',
            })}
          >
            <h2 className={css({ textStyle: 'campaignHeading' })}>
              Gemeinsam mit Ihnen können wir dort hinschauen, wo es wichtig ist.
            </h2>

            <p>
              Helfen Sie uns, die Republik bekannter zu machen. Kopieren Sie den
              Link unten und senden Sie ihn per E-mail, Direktnachricht oder auf
              Social Media weiter. Über diesen Link können alle die Republik ab
              CHF 1.- im ersten Monat abonnieren.
            </p>

            <ShareLink url={url} />

            <h3 className={css({ fontWeight: 'medium' })}> Warum teilen?</h3>
            <ul className={css({ listStyle: 'outside', pl: '4' })}>
              <li>
                Sie ermöglichen anderen einen günstigen Zugang zum
                Qualitätsjournalismus der Republik.
              </li>
              <li>
                Indem Sie den Link weiterverbreiten, wird die Arbeit der
                Republik sichtbarer und bekannter.
              </li>
              <li>
                Je grösser die Community, umso stabiler ist das Fundament für
                unseren Journalismus. Denn: Die Republik ist unabhängig und wird
                von ihren Leserinnen finanziert.
              </li>
            </ul>
          </div>
        </Container>
      </div>
    </>
  )
}
