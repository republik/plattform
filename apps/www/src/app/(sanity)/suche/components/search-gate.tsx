'use client'

import { UnauthorizedMessage } from '@/components/Auth/withMembership'

/** Thin client boundary so the async server page.tsx can render the
 * existing membership gate UI, which relies on client hooks (useMe,
 * useTranslation, useInNativeApp). */
export function SearchGate() {
  return <UnauthorizedMessage />
}
