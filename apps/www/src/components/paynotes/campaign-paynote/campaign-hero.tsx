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
          fontSize: '8xl',
          fontFamily: 'republikSerif',
          textAlign: 'left',
          lineHeight: '0.9',
        })}
      >
        Uns ist es nicht egal.
      </div>
    </div>
  )
}

export function CampaignHeroMini() {
  return (
    <div
      className={css({
        background: 'contrast',
        color: 'white',
      })}
    >
      <div
        className={css({
          fontSize: '3xl',
          fontFamily: 'republikSerif',
          textAlign: 'left',
          lineHeight: '1',
        })}
      >
        Uns ist nicht egal, was Sie von der Welt erfahren.
      </div>
    </div>
  )
}
