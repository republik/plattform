import { infobox } from '@republik/theme/recipes'
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
    <div className={infobox()}>
      <h2 className='infobox-title'>{title}</h2>
      {children}
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
