import { css } from '@republik/theme/css'
import { ReactNode } from 'react'

function OnboardingHeader({ children }: { children: ReactNode }) {
  return (
    <div
      className={css({
        textAlign: 'center',
        pb: 8,
        '& h1': {
          mt: 0,
          mb: 2,
          fontFamily: 'rubis',
          fontWeight: 500,
          fontSize: '2xl',
          lineHeight: '1.2',
        },
        '& h2': {
          fontFamily: 'rubis',
          fontWeight: 500,
          fontSize: 'l',
          color: 'textSoft',
        },
        '& p': {
          color: 'textSoft',
        },
      })}
    >
      {children}
    </div>
  )
}

export default OnboardingHeader
