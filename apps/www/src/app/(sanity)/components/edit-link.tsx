import { css } from '@republik/theme/css'
import { SquarePen } from 'lucide-react'
import Link from 'next/link'

const STUDIO_URL = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL

export function EditLink({ _id }: { _id: string }) {
  return (
    <Link
      href={`${STUDIO_URL}/structure/article;${_id}`}
      target='_blank'
      title='Edit in Studio'
      className={css({ color: 'orange' })}
    >
      <SquarePen />
    </Link>
  )
}
