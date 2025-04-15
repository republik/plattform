import { ReactNode } from 'react'

import { css } from '@republik/theme/css'

export const PaynoteContainer = ({ children }: { children: ReactNode }) => (
  <div
    className={css({
      borderTop: '2px solid',
      borderColor: 'text.black',
      my: '8',
    })}
  >
    {children}
  </div>
)

export const PaynoteSection = ({
  backgroundColor,
  children,
}: {
  backgroundColor: string
  children: ReactNode
}) => (
  <div
    data-theme='light'
    style={{
      // @ts-expect-error css vars
      '--bg': backgroundColor,
    }}
    className={css({
      background: 'var(--bg)',
      color: 'text',
    })}
  >
    <div
      className={css({
        margin: '0 auto',
        maxW: 'narrow',
        padding: '4-6',
        display: 'flex',
        flexDir: 'column',
        gap: '4',
        '& h2': {
          textStyle: 'h2Sans',
        },
        '& h3': {
          textTransform: 'uppercase',
          fontWeight: 500,
        },
        '& b': {
          fontWeight: 500,
        },
      })}
    >
      {children}
    </div>
  </div>
)
