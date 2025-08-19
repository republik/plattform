import { css } from '@republik/theme/css'
import { ReactNode } from 'react'

export function CampaignHeroSection({ children }: { children: ReactNode }) {
  return (
    <div
      className={css({
        background: '#313131',
        color: 'text.inverted',
      })}
    >
      <div
        className={css({
          py: '16',
          px: '4',
          margin: '0 auto',
          maxW: 'maxContentWidth',
          fontSize: '8xl',
          fontFamily: 'republikSerif',
          textAlign: 'left',
          lineHeight: '0.9',
        })}
      >
        {children}
      </div>
    </div>
  )
}
