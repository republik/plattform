import { css, keyframes } from 'glamor'
import { verlegerKampagneColors } from './config'

const srOnly = css({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
})

const growKeyFrame = keyframes({
  from: { width: 0 },
  to: { width: 'var(--progress-width)' },
})

export default function ProgressBar({
  from = 0,
  to,
  inverted,
}: {
  from?: number
  to: number
  inverted?: boolean
}) {
  const goalReachedRatio = from / to
  return (
    <div
      {...css({
        width: '100%',
      })}
    >
      <div
        {...css({
          overflow: 'hidden',
          background: inverted
            ? verlegerKampagneColors.yellowLight
            : verlegerKampagneColors.redLight,
          borderRadius: '2px',
          height: '5px',
          display: 'flex',
          flexGrow: 1,
        })}
      >
        <div
          {...css({
            background: inverted
              ? verlegerKampagneColors.yellow
              : verlegerKampagneColors.red,
            animationName: growKeyFrame,
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
      <span {...srOnly}>
        {from} von {to}
      </span>
    </div>
  )
}
