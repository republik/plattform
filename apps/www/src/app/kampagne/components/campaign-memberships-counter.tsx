'use client'

import { TARGET } from '@/app/kampagne/campaign-config'
import { AnimatedArrow } from '@/app/kampagne/components/handdrawn/animated-arrow'
import { useCampaign } from '@/app/components/paynotes/campaign/use-campaign'
import * as Progress from '@radix-ui/react-progress'
import { css } from '@republik/theme/css'

function CampaignMembershipsCounter({
  arrowSize,
}: {
  arrowSize?: 'xs' | 'sm' | 'md'
}) {
  const { members, progress, success } = useCampaign()

  return (
    <span>
      <Progress.Root
        className={css({
          position: 'relative',
          overflow: 'hidden',
          background: 'campaign26ProgressBackground',
          borderRadius: '1000px',
          width: '100%',
          height: '8',
          mb: '1',
        })}
        style={{
          // Fix overflow clipping in Safari
          // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
          transform: 'translateZ(0)',
        }}
        value={progress}
      >
        <Progress.Indicator
          className={css({
            backgroundColor: 'campaign26',
            borderRadius: '1000px',
            width: '100%',
            height: '100%',
            transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
          })}
          style={{ transform: `translateX(-${100 - progress}%)` }}
        />
      </Progress.Root>
      <span
        className={css({ display: 'flex', justifyContent: 'space-between' })}
      >
        <span className={css({ fontWeight: 500 })}>Neue Mitglieder</span>
        <span>
          <AnimatedArrow showArrow={success} size={arrowSize}>
            <span className={css({ fontWeight: 500 })}>{members}</span>
          </AnimatedArrow>
          /{TARGET}
        </span>
      </span>
    </span>
  )
}

export default CampaignMembershipsCounter
