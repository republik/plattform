import { css } from '@republik/theme/css'
import { SquarePen } from 'lucide-react'
import Link from 'next/link'

const STUDIO_URL = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL

export function EditLink({
  _id,
  documentType,
}: {
  _id: string
  documentType: string
}) {
  const structurePath =
    documentType === 'article'
      ? [documentType, 'articles-all', _id]
      : [documentType, _id]

  return (
    <Link
      href={`${STUDIO_URL}/structure/${structurePath.join(';')}`}
      target='_blank'
      title='Edit in Studio'
      className={css({ color: 'orange' })}
    >
      <SquarePen />
    </Link>
  )
}
