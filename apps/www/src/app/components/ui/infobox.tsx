import { css } from '@republik/theme/css'
import { ReactNode } from 'react'
import { Expandable } from './expandable'

function InfoboxBody({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className={css({ '& p': { ml: '0', mr: '0' } })}>
      <h3
        className={css({
          textStyle: 'h3Sans',
          borderColor: 'current',
          borderStyle: 'solid',
          borderTopWidth: '1px',
          py: '2',
          fontSize: { base: 'base', md: 'l' },
        })}
      >
        {title}
      </h3>
      <div
        className={css({
          textStyle: 'sans',
          lineHeight: '1.5',
          fontSize: { base: 'base', md: 'l' },
        })}
      >
        {children}
      </div>
    </div>
  )
}

export function Infobox({
  title,
  collapsible,
  children,
}: {
  title: string
  collapsible?: boolean
  children: ReactNode
}) {
  if (collapsible) {
    return (
      <Expandable>
        <InfoboxBody title={title}>{children}</InfoboxBody>
      </Expandable>
    )
  }

  return <InfoboxBody title={title}>{children}</InfoboxBody>
}
