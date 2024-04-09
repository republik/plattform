import { useEffect, useState } from 'react'
import { reportError } from '../errors/reportError'
import { useMe } from '../context/MeContext'
import { useQuery } from '@apollo/client'
import { ProlitterisConsentQueryDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { PROLITTERIS_OPT_OUT_CONSENT } from 'lib/constants'

function useProlitterisTracking(repoId: string, cleanedPath: string) {
  const { me, meLoading, hasAccess } = useMe()
  const { data, loading } = useQuery(ProlitterisConsentQueryDocument, {
    variables: { prolitterisConsent: PROLITTERIS_OPT_OUT_CONSENT },
  })
  const [onceAndDone, setOnceAndDone] = useState(false)

  const hasOptedOut = data?.me?.prolitterisOptOut
  const isLoading = meLoading || loading
  const isPayingUser = me && hasAccess

  useEffect(() => {
    if (onceAndDone) return
    if (isLoading) return
    if (hasOptedOut) return
    async function fetchProlitteris() {
      fetch(
        `/api/prolitteris?paid=${
          isPayingUser ? 'pw' : 'na'
        }&uid=${repoId}&path=${cleanedPath}`,
      ).catch((error) => reportError('prolitterisApiError', error))
    }
    fetchProlitteris()
    setOnceAndDone(true)
  }, [onceAndDone, isLoading, hasOptedOut, isPayingUser, repoId, cleanedPath])
}

export default useProlitterisTracking
