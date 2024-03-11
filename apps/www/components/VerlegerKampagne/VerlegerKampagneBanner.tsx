import { useQuery } from '@apollo/client'
import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import {
  CAMPAIGN_META_ARTICLE_URL,
  CAMPAIGN_REFERRALS_GOAL,
  CAMPAIGN_SLUG,
} from '@app/app/(campaign)/constants'
import { CampaignReferralsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { mediaQueries } from '@project-r/styleguide'
import { StyleAttribute, css } from 'glamor'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'
import Button from './Button'
import ProgressBar from './ProgressBar'
import './VerlegerKampagneBanner.css'
import { verlegerKampagneColors } from './config'
import { EventTrackingContext } from '@app/lib/matomo/event-tracking'
import { useRouter } from 'next/router'

const Center = ({
  children,
  wrapperStyle = css({
    backgroundColor: verlegerKampagneColors.red,
    color: verlegerKampagneColors.yellow,
  }),
  ...props
}: ComponentPropsWithoutRef<'div'> & { wrapperStyle?: StyleAttribute }) => (
  <div {...wrapperStyle}>
    <div
      {...css({
        margin: '0 auto',
        maxWidth: 775,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      })}
      {...props}
    >
      {children}
    </div>
  </div>
)

function useCampaignData() {
  return useQuery(CampaignReferralsDocument, {
    variables: { campaignSlug: CAMPAIGN_SLUG },
  })
}

const topBannerStyles = {
  container: css({
    padding: '15px 15px 15px 15px',
    [mediaQueries.mUp]: {
      padding: '15px 15px 15px 15px',
    },
  }),
  wrapper: css({
    display: 'flex',
    gap: 15,
    flexDirection: 'column',
    alignItems: 'center',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  }),
  logo: css({
    display: 'block',
    width: 90,
    maxWidth: '100%',
    height: 'auto',
    flexShrink: 0,
  }),
  content: css({
    flexGrow: 1,
    fontSize: 14,
    lineHeight: 1.4,

    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }),
  desktopOnly: css({
    display: 'none',
    [mediaQueries.mUp]: {
      display: 'block',
    },
  }),
  button: css({
    flexShrink: 0,
  }),
}

export function VerlegerKampagneBannerTop() {
  const { data } = useCampaignData()
  const { asPath } = useRouter()

  return (
    <EventTrackingContext category='CampaignBannerTop' name={asPath}>
      <Center {...topBannerStyles.container} data-show-if-active-membership>
        <div {...topBannerStyles.wrapper}>
          <CampaignLogo inverted className={`${topBannerStyles.logo}`} />
          <div {...topBannerStyles.content}>
            <div>
              Mit wenig Aufwand viel bewirken: Teilen Sie Ihren Link mit
              Freunden und Bekannten und erzählen Sie ihnen, was Sie an der
              Republik überzeugt.
            </div>
            <ProgressBar
              inverted
              from={data?.campaign.referrals.count || 0}
              to={CAMPAIGN_REFERRALS_GOAL}
            />
          </div>
          <div {...topBannerStyles.button}>
            <Button small inverted href='/jetzt-einladen'>
              Jetzt mithelfen
            </Button>
          </div>
        </div>
      </Center>
    </EventTrackingContext>
  )
}

const bottomBannerStyles = {
  container: css({
    padding: '30px 15px',
    [mediaQueries.mUp]: {
      padding: '30px 55px',
    },
    marginTop: 15,
  }),
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
  }),
  logo: css({
    display: 'block',
    width: 140,
    maxWidth: '100%',
    height: 'auto',
    flexShrink: 0,
  }),

  heading: css({
    margin: 0,
    fontFamily: 'Druk',
    fontSize: 42,
    fontStyle: 'normal',
    fontWeight: 500,
    width: '100%',
    [mediaQueries.mUp]: {
      fontSize: 42,
    },
  }),
  p: css({
    flexGrow: 1,
    fontSize: 17,
    lineHeight: 1.5,
    margin: 0,
    [mediaQueries.mUp]: {
      fontSize: 20,
    },
    '& a': {
      color: 'currentColor',
    },
  }),
  buttonGroup: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  }),
  buttonSubLine: css({
    fontSize: '1rem',
  }),
}

export function VerlegerKampagneBannerBottom() {
  const { data } = useCampaignData()
  const { asPath } = useRouter()

  return (
    <EventTrackingContext category='CampaignBannerBottom' name={asPath}>
      <Center
        {...bottomBannerStyles.container}
        wrapperStyle={css({
          background: verlegerKampagneColors.yellow,
          color: verlegerKampagneColors.red,
        })}
        data-show-if-active-membership
      >
        <div {...bottomBannerStyles.wrapper}>
          <CampaignLogo className={`${bottomBannerStyles.logo}`} />
          <h2 {...bottomBannerStyles.heading}>
            Die Republik gibt es, weil Sie etwas dafür tun.
          </h2>
          <div>
            <p {...bottomBannerStyles.p}>
              <Link href={CAMPAIGN_META_ARTICLE_URL}>
                Bis zum 31. März suchen wir mit Ihnen zusammen{' '}
                {CAMPAIGN_REFERRALS_GOAL} zusätzliche Verleger und Verlegerinnen
              </Link>
              . Mitmachen ist einfach: Teilen Sie Ihren persönlichen Link mit so
              vielen Bekannten wie möglich und erzählen Sie ihnen, warum Sie die
              Republik unterstützen.
            </p>
            {/* <p {...bottomBannerStyles.p}>
            Gemeinsam haben wir schon {data?.campaign?.referrals?.count || '-'}{' '}
            neue Verlegerinnen überzeugt.
          </p> */}
          </div>
          <div
            style={{
              width: '100%',
            }}
          >
            <ProgressBar
              from={data?.campaign.referrals.count || 0}
              to={CAMPAIGN_REFERRALS_GOAL}
            />
          </div>
          <div>
            <Button href='/jetzt-einladen'>Jetzt mithelfen</Button>
          </div>
        </div>
      </Center>
    </EventTrackingContext>
  )
}

export function VerlegerKampagnePayNoteTop({
  inNavigation,
}: {
  inNavigation?: boolean
}) {
  const { asPath } = useRouter()

  return (
    <EventTrackingContext category='CampaignPayNoteTop' name={asPath}>
      <Center
        {...bottomBannerStyles.container}
        wrapperStyle={css({
          background: verlegerKampagneColors.red,
          color: verlegerKampagneColors.yellow,
        })}
        style={{ padding: inNavigation ? 30 : undefined }}
        data-hide-if-active-membership='true'
      >
        <div {...bottomBannerStyles.wrapper}>
          <CampaignLogo inverted className={`${bottomBannerStyles.logo}`} />
          <h2 {...bottomBannerStyles.heading}>
            Unabhängiger Journalismus lebt vom Einsatz vieler
          </h2>
          <div>
            <p {...bottomBannerStyles.p}>
              Unterstützen auch Sie die Republik mit einem Abo: Einstiegsangebot
              nur bis 31.&nbsp;März&nbsp;2024.
            </p>
          </div>
          <div {...bottomBannerStyles.buttonGroup}>
            <Button inverted href='/jetzt/angebot'>
              Wählen Sie Ihren Einstiegspreis
            </Button>
            <div {...bottomBannerStyles.buttonSubLine}>
              Ab CHF 120 für&nbsp;ein&nbsp;Jahr
            </div>
          </div>
        </div>
      </Center>
    </EventTrackingContext>
  )
}

export function VerlegerKampagnePayNoteBottom() {
  const { asPath } = useRouter()

  return (
    <EventTrackingContext category='CampaignPayNoteBottom' name={asPath}>
      <Center
        {...bottomBannerStyles.container}
        wrapperStyle={css({
          background: verlegerKampagneColors.red,
          color: verlegerKampagneColors.yellow,
        })}
        data-hide-if-active-membership='true'
      >
        <div {...bottomBannerStyles.wrapper}>
          <CampaignLogo inverted className={`${bottomBannerStyles.logo}`} />
          <h2 {...bottomBannerStyles.heading}>
            Unabhängiger Journalismus lebt vom Einsatz vieler
          </h2>
          <div>
            <p {...bottomBannerStyles.p}>
              Artikel wie diesen gibt es nur, wenn genügend Menschen die
              Republik mit einem Abo unterstützen. Kommen Sie bis zum
              31.&nbsp;März&nbsp;an&nbsp;Bord!
            </p>
          </div>
          <div {...bottomBannerStyles.buttonGroup}>
            <Button inverted href='/jetzt/angebot'>
              Wählen Sie Ihren Einstiegspreis
            </Button>
            <div {...bottomBannerStyles.buttonSubLine}>
              Ab CHF 120 für&nbsp;ein&nbsp;Jahr
            </div>
          </div>
        </div>
      </Center>
    </EventTrackingContext>
  )
}
