import { css } from '@app/styled-system/css'

export const CampaignProgress = async ({ goal = 1000 }: { goal?: number }) => {
  const reached = 318

  const goalReachedRatio = Math.min(1, reached / goal)

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
        {reached} von {goal}
      </div>
    </div>
  )
}
