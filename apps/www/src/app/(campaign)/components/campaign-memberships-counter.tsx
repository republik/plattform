'use client'

import * as Progress from '@radix-ui/react-progress'
import { css } from '@republik/theme/css'
import React from 'react' // TODO: get real numbers

// TODO: get real numbers
function CampaignMembershipsCounter() {
  const progress = (1230 / 2000) * 100

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
          <span className={css({ fontWeight: 500 })}>1230</span>
          /2000
        </span>
      </span>
    </span>
  )
}

export default CampaignMembershipsCounter
