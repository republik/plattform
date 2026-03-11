import * as Progress from '@radix-ui/react-progress'
import { css } from '@republik/theme/css'
import React from 'react' // TODO: get real numbers

// TODO: get real numbers
function CampaignMembershipsCounter() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
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
      <span className={css({ float: 'left', fontWeight: 500 })}>
        Neue Mitglieder
      </span>
      <span className={css({ float: 'right' })}>
        <span className={css({ fontWeight: 500 })}>120</span>
        /2000
      </span>
    </div>
  )
}

export default CampaignMembershipsCounter
