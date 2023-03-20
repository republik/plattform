import { mediaQueries, fontStyles, Loader } from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import Frame from '../../Frame'
import { useUserInviteQuery } from '../graphql/useUserInviteQuery'
import RewardProgress from './RewardProgress'
import { enforceMembership } from '../../Auth/withMembership'
import { MeObjectType } from '../../../lib/context/MeContext'
import { useNumOfRedeemedInvitesQuery } from '../graphql/useNumOfRedeemedInvitesQuery'
import dynamic from 'next/dynamic'

const Confetti = dynamic(() => import('./Confetti'), {
  ssr: false,
})

export const FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES = 5
export const FUTURE_CAMPAIGN_TOTAL_PARTICIPANTS = 1364
export const FUTURE_CAMPAIGN_TOTAL_ABOS = 2588

const InviteSenderPage = ({ me }: { me: MeObjectType }) => {
  const { data: userInviteData } = useUserInviteQuery()
  const { data: redeemedInvites, loading: loadingRedeemedInvites } =
    useNumOfRedeemedInvitesQuery()

  const hasRedeemedAllInvites =
    FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES ===
    redeemedInvites?.me?.futureCampaignAboCount

  return (
    <Frame
      pageColorSchemeKey='dark'
      containerMaxWidth={'700px'}
      meta={{
        title: 'Verstärkung holen',
      }}
    >
      <main>
        <Confetti renderOverlay={userInviteData?.me?.hasAddress} />
        <div {...styles.headingWrapper}>
          <h1 {...styles.heading}>
            Unabhängiger Journalismus hat eine Zukunft, weil Sie es wollen!
          </h1>
        </div>
        <p {...styles.largeText}>
          Dank{' '}
          {redeemedInvites?.me?.futureCampaignAboCount !== 0
            ? `Ihnen und ${FUTURE_CAMPAIGN_TOTAL_PARTICIPANTS - 1}`
            : FUTURE_CAMPAIGN_TOTAL_PARTICIPANTS}{' '}
          Verlegerinnen ist die Republik um {FUTURE_CAMPAIGN_TOTAL_ABOS} Stimmen
          reicher geworden.
        </p>
        {redeemedInvites?.me?.futureCampaignAboCount !== 0 && (
          <>
            <p {...styles.largeText}>
              Sie haben {redeemedInvites?.me?.futureCampaignAboCount} neue
              Mitstreiter an Bord geholt.
            </p>

            <Loader
              loading={loadingRedeemedInvites}
              render={() => (
                <RewardProgress
                  reached={redeemedInvites?.me?.futureCampaignAboCount || 0}
                  max={FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES}
                />
              )}
            />
          </>
        )}
        <p {...styles.largeText}>Vielen herzlichen Dank!</p>
        {hasRedeemedAllInvites && (
          <p {...styles.text}>
            Zum Dank erhalten Sie in den nächsten Wochen eine
            Republik-Jubiläumstasche zugesandt.{' '}
            {!userInviteData?.me?.hasAddress && (
              <span>
                Vergessen Sie nicht,{' '}
                <Link href='/konto' passHref>
                  <a {...styles.inlineLink}>
                    im Konto Ihre Adresse zu hinterlegen
                  </a>
                </Link>
                , damit wir Ihnen das Geschenk zustellen können.
              </span>
            )}
          </p>
        )}
      </main>
    </Frame>
  )
}

export default enforceMembership()(InviteSenderPage)

const styles = {
  headingWrapper: css({
    display: 'grid',
  }),
  heading: css({
    gridColumn: 1,
    gridRow: 1,
    margin: '20px 0 32px 0',
    ...fontStyles.serifTitle26,
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      ...fontStyles.serifTitle38,
      margin: '24px 0 46px 0',
    },
  }),
  largeText: css({
    ...fontStyles.sansSerifRegular22,
    margin: 0,
    marginBottom: 24,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular26,
      marginBottom: 32,
    },
  }),
  text: css({
    ...fontStyles.sansSerifRegular16,
    marginTop: 0,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular18,
    },
  }),
  inlineLink: css({
    color: 'inherit',
    textDecoration: 'underline',
  }),
}
