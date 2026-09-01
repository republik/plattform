'use client'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { Button as ButtonComponent } from '@/app/components/ui/button'

// Our buttons are really links
// Don't use next/link on purpose because they're most likely external links
export function Button({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'button' }>
}) {
  return (
    <ButtonComponent asChild>
      <a href={value.url}>{value.text}</a>
    </ButtonComponent>
  )
}
