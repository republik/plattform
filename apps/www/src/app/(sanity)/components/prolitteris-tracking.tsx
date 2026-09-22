'use client'

import { useMe } from '@/lib/context/MeContext'
import { reportError } from '@/lib/errors/reportError'
import { useEffect, useRef } from 'react'

// the ID cannot change over time. articles who have a (legacy) repoId
// keep using it for prolitteris articles. Newer articles lack the repoId.
// There, we start fresh and use the sanityId.
export function ProlitterisTracking({
  repoId,
  sanityId,
  path,
}: {
  repoId?: string
  sanityId: string
  path: string
}) {
  const { me, meLoading, hasActiveMembership } = useMe()
  // A ref, not state: two effect runs in the same commit (StrictMode, or a
  // re-render before state settles) would otherwise report the read twice.
  const reported = useRef(false)

  useEffect(() => {
    if (reported.current) return
    // `me` decides both whether to count at all and whether the read is paid,
    // so nothing is reported until it has loaded.
    if (meLoading) return
    if (me?.prolitterisOptOut) return

    reported.current = true

    const uuid = repoId ?? sanityId

    fetch(
      `/api/prolitteris?paid=${
        hasActiveMembership ? 'pw' : 'na'
      }&uid=${uuid}&path=${path}`,
    ).catch((error) => reportError('prolitterisApiError', error))
  }, [me, meLoading, hasActiveMembership, repoId, sanityId, path])

  return null
}
