import { css } from '@republik/theme/css'
import type { ReactNode } from 'react'

export const EditorialParagraph = function ({
  children,
}: {
  children?: ReactNode
}) {
  return <p>{children}</p>
}

export const EditorialSubhead = function ({
  children,
}: {
  children?: ReactNode
}) {
  return (
    <h2
      className={css({
        textStyle: 'editorialH2',
        mt: '36px',
        mb: '8px',
        md: {
          mt: '46px',
          mb: '12px',
        },
        '& + p': { marginTop: 0 },
        _first: {
          marginTop: 0,
        },
        _last: {
          marginBottom: 0,
        },
      })}
    >
      {children}
    </h2>
  )
}
