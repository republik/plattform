import { css } from '@republik/theme/css'
import type { PortableTextMarkComponentProps } from 'next-sanity'

export function ExpandableLink({
  text,
  value,
}: PortableTextMarkComponentProps) {
  return (
    <a
      href={value.href}
      target='_blank'
      rel='noreferrer'
      className={css({ backgroundColor: 'blue' })}
    >
      {text}
    </a>
  )
}
