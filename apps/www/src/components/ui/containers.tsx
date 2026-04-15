import { css } from '@republik/theme/css'
import { Token, token } from '@republik/theme/tokens'
import { ReactNode } from 'react'

export const PaynoteContainer = ({
  children,
  testId,
}: {
  children: ReactNode
  testId?: string
}) => (
  <div
    data-testid={testId}
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
  background = 'colors.background.marketing',
  children,
}: {
  background?: Token
  children: ReactNode
}) => {
  return (
    <div
      data-theme='light'
      style={{
        background: token(background),
      }}
      className={css({
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
}

export const Frame = ({ children }: { children: ReactNode }) => {
  return (
    <div className={css({ minH: '100vh', display: 'flex', flexDir: 'column' })}>
      {children}
    </div>
  )
}
