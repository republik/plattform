'use client'
import { editUrl, type EditUrlProps } from '@/app/(sanity)/lib/edit-url'
import { css } from '@republik/theme/css'
import { SquarePen } from 'lucide-react'
import { useVisualEditingEnvironment } from 'next-sanity/hooks'

export function EditLink(props: EditUrlProps) {
  const visualEditingEnvironment = useVisualEditingEnvironment()

  if (
    !visualEditingEnvironment ||
    visualEditingEnvironment === 'presentation-iframe'
  ) {
    return null
  }

  const href = editUrl(props)

  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className={css({
        px: '4',
        py: '2',
        backgroundColor: 'orange',
        borderRadius: 'full',
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2',
      })}
    >
      <SquarePen size={20} /> Im Studio bearbeiten
    </a>
  )
}
