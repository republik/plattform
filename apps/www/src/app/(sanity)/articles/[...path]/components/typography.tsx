import { editorialWidthAttrs } from '@/app/(sanity)/articles/[...path]/styles'
import { css } from '@republik/theme/css'
import { ReactNode } from 'react'

export const EditorialParagraph = function ({
  children,
}: {
  children?: ReactNode
}) {
  return (
    <p
      className={css({
        ...editorialWidthAttrs,
        textStyle: 'editorialParagraph',
        my: '8',
      })}
    >
      {children}
    </p>
  )
}

export const EditorialSubhead = function ({
  children,
}: {
  children?: ReactNode
}) {
  return (
    <h2
      className={css({
        ...editorialWidthAttrs,
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

export const Strong = function ({ children }: { children?: ReactNode }) {
  return <strong className={css({ fontWeight: 700 })}>{children}</strong>
}

export const Em = function ({ children }: { children?: ReactNode }) {
  return <em className={css({ fontStyle: 'italic' })}>{children}</em>
}

const subSupBaseAttrs = {
  display: 'inline-block',
  textDecoration: 'none',
  fontSize: '75%',
  lineHeight: '1.4em',
  position: 'relative',
  verticalAlign: 'baseline',
}

export const Sup = function ({ children }: { children?: ReactNode }) {
  return (
    <sup className={css({ ...subSupBaseAttrs, top: '-0.5em' })}>{children}</sup>
  )
}

export const Sub = function ({ children }: { children?: ReactNode }) {
  return (
    <sub className={css({ ...subSupBaseAttrs, bottom: '-0.25em' })}>
      {children}
    </sub>
  )
}
