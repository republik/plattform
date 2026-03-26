'use client'

import { useCampaign } from '@app/components/paynotes/campaign/use-campaign'
import * as Progress from '@radix-ui/react-progress'
import { css } from '@republik/theme/css'
import React, { useEffect } from 'react' // TODO: get real numbers

const TARGET_MEMBERS = 2000

function CampaignMembershipsCounter() {
  const { campaign } = useCampaign()
  const [members, setMembers] = React.useState(0)
  const [progress, setProgress] = React.useState(0)

  useEffect(() => {
    const count = campaign?.newMembers?.count ?? 0
    setMembers(count)
    setProgress((count / TARGET_MEMBERS) * 100)
  }, [campaign, setMembers, setProgress])

  // TODO: emoji (+ confetti?)
  // const isSuccess = members >= TARGET_MEMBERS

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
          <span className={css({ fontWeight: 500 })}>{members}</span>/
          {TARGET_MEMBERS}
        </span>
      </span>
    </span>
  )
}

export default CampaignMembershipsCounter
