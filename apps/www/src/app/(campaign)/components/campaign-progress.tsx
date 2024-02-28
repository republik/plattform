import { getCampaignReferralsData } from '@app/app/(campaign)/campaign-data'
import { css } from '@app/styled-system/css'
import { CAMPAIGN_REFERRALS_GOAL } from '../constants'

export const CampaignProgress = async () => {
  const data = await getCampaignReferralsData()

  const reached = data.campaign?.referrals.count ?? 0

  const goalReachedRatio = Math.min(1, reached / CAMPAIGN_REFERRALS_GOAL)

  return (
    <div
      className={css({
        textStyle: 'sansSerifMedium',
        fontSize: 'l',
        display: 'flex',
        gap: '4',
        width: 'full',
        alignItems: 'center',
      })}
    >
      <div
        className={css({
          border: '2px solid token(colors.primary)',
          borderRadius: '6px',
          height: '1.5rem',
          display: 'flex',
          flexGrow: 1,
        })}
      >
        <div
          className={css({
            background: 'primary',
            animationName: 'progressGrow',
            animationTimingFunction: 'ease-in-out',
            animationDuration: '1000ms',
            animationFillMode: 'forwards',
            animationDelay: '500ms',
          })}
          style={{
            // @ts-expect-error custom var
            '--progress-width': `${goalReachedRatio * 100}%`,
          }}
        ></div>
      </div>

      <div>
        {reached} von {CAMPAIGN_REFERRALS_GOAL}
      </div>
    </div>
  )
}
