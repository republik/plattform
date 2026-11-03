'use client'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { Button as ButtonComponent } from '@/app/components/ui/button'
import Link from '@/app/components/ui/link'
import type { ComponentProps } from 'react'

function Anchor({
  slug,
  url,
  text,
  ...props
}: {
  slug?: string | null
  url?: string
  text?: string
} & Omit<ComponentProps<'a'>, 'href'>) {
  if (slug) {
    return (
      <Link {...props} href={slug}>
        {text}
      </Link>
    )
  }

  return (
    <a {...props} href={url} target='_blank' rel='noreferrer'>
      {text}
    </a>
  )
}

export function Button({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'button' }>
}) {
  const { slug, url, text } = value
  return (
    <ButtonComponent asChild>
      <Anchor url={url} slug={slug} text={text} />
    </ButtonComponent>
  )
}
