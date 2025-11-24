import { css } from '@republik/theme/css'
import { ReactNode } from 'react'

export function OnboardingH3({ children }: { children: ReactNode }) {
  return (
    <h3
      className={css({
        fontFamily: 'gtAmericaStandard',
        fontWeight: 'bold',
        mb: 4,
      })}
    >
      {children}
    </h3>
  )
}
