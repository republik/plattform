import * as Collapsible from '@radix-ui/react-collapsible'
import { css } from '@republik/theme/css'
import { ReactNode } from 'react'

export function Expandable({ children }: { children: ReactNode }) {
  return (
    <Collapsible.Root>
      <Collapsible.Content
        forceMount
        className={css({
          '&[data-state="closed"]': {
            overflow: 'hidden',
            position: 'relative',
            height: 121,
            md: {
              height: 151,
            },
            _after: {
              content: '""',
              display: 'block',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 80,
              bgGradient: 'simple',
              pointerEvents: 'none',
            },
            _print: {
              overflow: 'visible',
              height: 'auto',
              _after: {
                display: 'none',
              },
            },
          },
        })}
      >
        {children}
      </Collapsible.Content>
      <Collapsible.Trigger
        className={css({
          textStyle: 'sans',
          textDecoration: 'underline',
          fontWeight: 500,
          color: 'textSoft',
          cursor: 'pointer',
          py: '2',
          _print: { display: 'none' },
        })}
      >
        <span className={css({ '[data-state="open"] &': { display: 'none' } })}>
          Mehr lesen
        </span>
        <span
          className={css({ '[data-state="closed"] &': { display: 'none' } })}
        >
          Weniger lesen
        </span>
      </Collapsible.Trigger>
    </Collapsible.Root>
  )
}
