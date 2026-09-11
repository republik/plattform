'use client'

import { useMe } from '@/lib/context/MeContext'
import { reportError } from '@/lib/errors/reportError'
import { useEffect, useRef } from 'react'

/**
 * Reports a read to ProLitteris, the Swiss reprographic rights society, which
 * distributes royalties by counted accesses.
 *
 * `repoId` identifies the article to them and the path becomes the Referer —
 * see pages/api/prolitteris.ts, which proxies the call so the reader's IP is
 * truncated before it leaves us. Readers who opted out are not counted.
 */
export function ProlitterisTracking({
  repoId,
  path,
}: {
  repoId: string
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

    fetch(
      `/api/prolitteris?paid=${
        hasActiveMembership ? 'pw' : 'na'
      }&uid=${repoId}&path=${path}`,
    ).catch((error) => reportError('prolitterisApiError', error))
  }, [me, meLoading, hasActiveMembership, repoId, path])

  return null
}
