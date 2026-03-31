'use client'

import { Button } from '@/components/ui'
import {
  MeDocument,
  SignOutDocument,
} from '@/graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { vstack } from '@republik/theme/patterns'

export function Me() {
  const { data, loading } = useQuery(MeDocument)
  const [signOut, { loading: signOutLoading }] = useMutation(SignOutDocument)

  if (loading) {
    return null
  }

  if (data?.me) {
    return (
      <div className={vstack({ alignItems: 'end', gap: '1', fontSize: 's' })}>
        {data.me.name ?? data.me.email}

        <Button
          variant='link'
          disabled={signOutLoading}
          onClick={() => {
            signOut().then(() => {
              window.location.reload()
            })
          }}
        >
          Abmelden
        </Button>
      </div>
    )
  }
}
