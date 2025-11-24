import { Button } from '@app/components/ui/button'
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

export function OnboardingNextStep({ onNextStep }: { onNextStep: () => void }) {
  return (
    <div
      className={css({
        position: 'sticky',
        bottom: 0,
        background: 'background',
        textAlign: 'center',
        p: 6,
        pt: 2,
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'black',
      })}
    >
      <p className={css({ fontSize: 's', color: 'textSoft' })}>
        Ändern im Konto jederzeit möglich.
      </p>

      <Button
        type='button'
        size='full'
        className={css({ mt: 2 })}
        onClick={onNextStep}
      >
        Weiter
      </Button>
    </div>
  )
}
