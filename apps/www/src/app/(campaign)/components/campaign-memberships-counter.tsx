'use client'

import { useCampaign } from '@app/components/paynotes/campaign/use-campaign'
import * as Progress from '@radix-ui/react-progress'
import { css } from '@republik/theme/css'
import React from 'react' // TODO: get real numbers

const TARGET_MEMBERS = 2000

function CampaignMembershipsCounter() {
  const { campaign, loading } = useCampaign()
  if (loading) return null
  const members = campaign?.newMembers?.count ?? 0
  const progress = (members / TARGET_MEMBERS) * 100

  // TODO: emoji
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
