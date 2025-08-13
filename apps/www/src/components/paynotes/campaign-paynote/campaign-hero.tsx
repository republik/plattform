import { css } from '@republik/theme/css'

export function CampaignHero() {
  return (
    <div
      className={css({
        background: 'contrast',
        color: 'white',
      })}
    >
      <div
        className={css({
          p: '8',
          margin: '0 auto',
          maxW: '34rem',
          fontSize: '4xl',
          fontFamily: 'republikSerif',
        })}
      >
        Uns isses nich egaaal!
      </div>
    </div>
  )
}
