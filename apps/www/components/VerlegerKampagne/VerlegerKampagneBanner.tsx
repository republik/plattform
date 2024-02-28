import { useQuery } from '@apollo/client'
import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import {
  CAMPAIGN_META_ARTICLE_URL,
  CAMPAIGN_REFERRALS_GOAL,
  CAMPAIGN_SLUG,
} from '@app/app/(campaign)/constants'
import { CampaignReferralsDocument } from '@app/graphql/republik-api/gql/graphql'
import { mediaQueries } from '@project-r/styleguide'
import { StyleAttribute, css } from 'glamor'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'
import Button from './Button'
import ProgressBar from './ProgressBar'
import './VerlegerKampagneBanner.css'
import { verlegerKampagneColors } from './config'

const Center = ({
  children,
  wrapperStyle = css({
    backgroundColor: verlegerKampagneColors.red,
    color: verlegerKampagneColors.yellow,
  }),
  ...props
}: ComponentPropsWithoutRef<'div'> & { wrapperStyle?: StyleAttribute }) => (
  <div {...wrapperStyle} data-show-if-active-membership>
    <div
      {...css({
        margin: '0 auto',
        width: 780,
        maxWidth: '100%',
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
}

export function VerlegerKampagneBannerTop() {
  const { data, loading } = useCampaignData()

  return (
    <Center {...topBannerStyles.container}>
      <div {...topBannerStyles.wrapper}>
        <CampaignLogo inverted className={`${topBannerStyles.logo}`} />
        <div {...topBannerStyles.content}>
          <div>
            Bis zum 31. März suchen wir mit Ihnen zusammen{' '}
            {CAMPAIGN_REFERRALS_GOAL} zusätzliche Verleger.
          </div>
          <ProgressBar
            inverted
            from={data?.campaign.referrals.count || 0}
            to={CAMPAIGN_REFERRALS_GOAL}
          />
        </div>
        <Button small inverted href='/jetzt-einladen'>
          Jetzt mithelfen
        </Button>
      </div>
    </Center>
  )
}

const bottomBannerStyles = {
  container: css({
    padding: '40px 15px',
    [mediaQueries.mUp]: {
      padding: '40px',
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
    fontSize: 48,
    fontStyle: 'normal',
    fontWeight: 500,
    width: '100%',
    [mediaQueries.mUp]: {
      fontSize: 48,
    },
  }),
  p: css({
    flexGrow: 1,
    fontSize: 16,
    lineHeight: 1.4,
    margin: 0,
    [mediaQueries.mUp]: {
      fontSize: 17,
    },
    '& a': {
      color: 'currentColor',
    },
  }),
}

export function VerlegerKampagneBannerBottom() {
  const { data, loading } = useCampaignData()

  return (
    <Center
      {...bottomBannerStyles.container}
      wrapperStyle={css({
        background: verlegerKampagneColors.yellow,
        color: verlegerKampagneColors.red,
      })}
    >
      <div {...bottomBannerStyles.wrapper}>
        <CampaignLogo className={`${bottomBannerStyles.logo}`} />
        <h2 {...bottomBannerStyles.heading}>
          Die Republik gibt es, weil Sie etwas dafür tun.
        </h2>
        <div>
          <p {...bottomBannerStyles.p}>
            <Link href={CAMPAIGN_META_ARTICLE_URL}>
              Bis zum 31. März suchen wir mit Ihnen zusammen 1000 zusätzliche
              Verlegerinnen
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
  )
}
