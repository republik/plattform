import { ReactNode } from 'react'

import { css } from '@republik/theme/css'
import { ColorToken } from '@republik/theme/tokens'

export const PaynoteContainer = ({ children }: { children: ReactNode }) => (
  <div
    className={css({
      borderTop: '2px solid',
      borderColor: 'text.black',
      mb: '16',
    })}
  >
    {children}
  </div>
)

export const PaynoteSection = ({
  background,
  children,
}: {
  background: ColorToken
  children: ReactNode
}) => (
  <div
    data-theme='light'
    className={css({
      background,
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
