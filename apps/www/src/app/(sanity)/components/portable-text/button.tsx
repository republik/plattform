'use client'
import { Button as ButtonComponent } from '@/app/components/ui/button'
import type { Button as ButtonT } from '@/sanity.types'

// Our buttons are really links
// Don't use next/link on purpose because they're most likely external links
export function Button({ value }: { value: ButtonT }) {
  return (
    <ButtonComponent asChild>
      <a href={value.url}>{value.text}</a>
    </ButtonComponent>
  )
}
