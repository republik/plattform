import { useQuery } from '@apollo/client'
import {
  CAMPAIGN_REFERRALS_GOAL,
  CAMPAIGN_SLUG,
} from '@app/app/(campaign)/constants'
import { CampaignReferralsDocument } from '@app/graphql/republik-api/gql/graphql'
import { mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import ProgressBar from './ProgressBar'
import { verlegerKampagneColors } from './config'
import Button from './Button'
import { ComponentPropsWithoutRef } from 'react'
import './VerlegerKampagneBanner.css'
import Link from 'next/link'

const Icon = ({
  height = '1em',
  width = '1em',
}: Pick<ComponentPropsWithoutRef<'svg'>, 'height' | 'width'>) => (
  <svg
    width={width}
    height={height}
    viewBox='0 0 34 27'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M27 11.8125V15.1875H33.75V11.8125H27ZM23.625 22.9669C25.245 24.165 27.3544 25.7512 29.025 27C29.7 26.1056 30.375 25.1944 31.05 24.3C29.3794 23.0512 27.27 21.465 25.65 20.25C24.975 21.1612 24.3 22.0725 23.625 22.9669ZM31.05 2.7C30.375 1.80562 29.7 0.894375 29.025 0C27.3544 1.24875 25.245 2.835 23.625 4.05C24.3 4.94438 24.975 5.85563 25.65 6.75C27.27 5.535 29.3794 3.96562 31.05 2.7ZM3.375 8.4375C1.51875 8.4375 0 9.95625 0 11.8125V15.1875C0 17.0438 1.51875 18.5625 3.375 18.5625H5.0625V25.3125H8.4375V18.5625H10.125L18.5625 23.625V3.375L10.125 8.4375H3.375ZM22.7812 13.5C22.7812 11.2556 21.8025 9.23062 20.25 7.84687V19.1362C21.8025 17.7694 22.7812 15.7444 22.7812 13.5Z'
      fill='currentColor'
    />
  </svg>
)

const Center = ({ children, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div
    {...css({
      backgroundColor: verlegerKampagneColors.red,
      color: verlegerKampagneColors.yellow,
    })}
    data-show-if-active-membership
  >
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
    padding: '10px 15px 15px 15px',
    [mediaQueries.mUp]: {
      padding: '10px 40px 15px 40px',
    },
  }),
  wrapper: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  }),
  p: css({
    flexGrow: 1,
    fontSize: 12,
    [mediaQueries.mUp]: {
      fontSize: 14,
    },
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
        <div>
          <Icon height={27} width='auto' />
        </div>
        <p {...topBannerStyles.p}>
          Bis zum 31. März suchen wir mit Ihnen zusammen{' '}
          {CAMPAIGN_REFERRALS_GOAL} zusätzliche Verleger.
        </p>
        <Button small href='/jetzt-einladen'>
          Jetzt mithelfen
        </Button>
      </div>
      <div>
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
    alignItems: 'flex-start',
    gap: 16,
  }),
  header: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    [mediaQueries.mUp]: {
      gap: 32,
    },
  }),
  heading: css({
    margin: 0,
    fontFamily: 'Druk',
    fontSize: 32,
    fontStyle: 'normal',
    fontWeight: 500,
    [mediaQueries.mUp]: {
      fontSize: 44,
    },
  }),
  p: css({
    flexGrow: 1,
    fontSize: 14,
    [mediaQueries.mUp]: {
      fontSize: 17,
    },
  }),
}

export function VerlegerKampagneBannerBottom() {
  const { data, loading } = useCampaignData()

  return (
    <Center {...bottomBannerStyles.container}>
      <div {...bottomBannerStyles.wrapper}>
        <div {...bottomBannerStyles.header}>
          <Icon height={36} width={44} />
          <h2 {...bottomBannerStyles.heading}>
            Die Republik gibt es, weil wir etwas dafür tun.
          </h2>
        </div>
        <div>
          <p {...bottomBannerStyles.p}>
            Bis zum 31. März suchen wir mit Ihnen zusammen 1000 zusätzliche
            Verlegerinnen (Link zum Metaartikel). Mitmachen ist einfach: Teilen
            Sie Ihren persönlichen Link mit so vielen Bekannten wie möglich und
            erzählen Sie ihnen, warum Sie die Republik unterstützen.
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
