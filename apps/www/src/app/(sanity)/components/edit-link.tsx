import { editUrl, type EditUrlProps } from '@/app/(sanity)/lib/edit-url'
import { css } from '@republik/theme/css'
import { SquarePen } from 'lucide-react'

export function EditLink(props: EditUrlProps) {
  const href = editUrl(props)

  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      title='Im Studio bearbeiten'
      className={css({
        color: 'orange',
      })}
    >
      <SquarePen />
    </a>
  )
}
