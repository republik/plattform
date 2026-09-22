// Imports the module `next/link` leads to infinite recursion in the bundler
import NextLink from 'next/dist/client/link'
import type { ComponentProps } from 'react'

export type LinkProps = ComponentProps<typeof NextLink>

export default function Link({ prefetch = false, ...props }: LinkProps) {
  return <NextLink prefetch={prefetch} {...props} />
}
