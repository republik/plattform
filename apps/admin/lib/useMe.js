import { useQuery } from '@apollo/client'
import { ME_QUERY } from './withMe'
import { useEffect } from 'react'
import { setUser as setSentryUser } from '@sentry/nextjs'

export function useMe() {
  const { data } = useQuery(ME_QUERY)

  // set sentry user
  useEffect(() => {
    if (data?.me) {
      setSentryUser({ id: data?.me.id })
    } else {
      setSentryUser(null)
    }

    return () => {
      setSentryUser(null)
    }
  }, [data?.me])

  return {
    me: data?.me,
  }
}
