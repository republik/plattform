import { getSenderData } from '@app/app/(campaign)/campaign-data'
import { CampaignProgress } from '@app/app/(campaign)/components/campaign-progress'
import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import {
  ShareImageConfigurator,
  ShareLink,
} from '@app/app/(campaign)/jetzt-einladen/share-components'
import Container from '@app/components/container'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CAMPAIGN_REFERRALS_GOAL } from '../constants'

export default async function Page() {
  const { me } = await getSenderData()

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/jetzt/${
    me?.hasPublicProfile ? me.username : me?.referralCode
  }`

  if (!me) {
    return redirect('/anmelden')
  }

  return (
    <Container>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '8',
          py: '8-16',
          fontSize: 'xl',
        })}
      >
        {/* <p>
          {' '}
          <strong>
            Nice! Sie haben schon {data.me?.futureCampaignAboCount} Leute
            eingeladen 🎉
          </strong>
        </p> */}

        <h1 className={css({ textStyle: 'campaignHeading' })}>
          <TypewriterContent />
        </h1>

        <p>
          Lassen Sie uns diese Verantwortung auf mehr Schultern verteilen:{' '}
          <Link href='#'>
            Bis zum 31. März suchen wir {CAMPAIGN_REFERRALS_GOAL} zusätzliche
            Verlegerinnen.
          </Link>
          . Denn je mehr Menschen sich einsetzen, desto breiter ist die
          Grundlage für das, weshalb wir alle hier sind: unabhängiger
          Journalismus.
        </p>

        <p>Aktueller Zwischenstand:</p>

        <div>
          <CampaignProgress />
        </div>

        <h2 className={css({ textStyle: 'campaignHeading' })}>
          Helfen Sie mit!
        </h2>

        <p>
          Teilen Sie Ihren Kampagnen-Link. Über diesen erhalten die
          Empfängerinnen ein zeitlich limitiertes Einstiegsangebot: ein Jahr
          Republik ab CHF 120. Wenn das erste Mal jemand über Ihren Link ein
          neues Abo abschliesst,{' '}
          {['ABO', 'BENEFACTOR_ABO'].includes(
            me?.activeMembership?.type.name,
          ) && <>verlängern wir Ihr eigenes um einen Monat.</>}
          {me?.activeMembership?.type.name === 'MONTHLY_ABO' && (
            <>
              schreiben wir Ihnen auf einen schreiben wir Ihnen auf einen
              zukünftigen Republik-Monat CHF 20 gut.
            </>
          )}
        </p>

        <ShareLink url={url} />

        <p>
          Ein Link ist Ihnen zu unpersönlich? Dann teilen Sie Ihr
          Kampagnen-Bild.
        </p>

        <ShareImageConfigurator
          url={url}
          userHasPublicProfile={me?.hasPublicProfile}
        />
      </div>
    </Container>
  )
}
