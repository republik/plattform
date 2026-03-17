'use client'

import {
  MeDocument,
  SignOutDocument,
} from '@/graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
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

        <button
          className={css({ color: 'primary' })}
          type='button'
          disabled={signOutLoading}
          onClick={() => {
            signOut().then(() => {
              window.location.reload()
            })
          }}
        >
          Abmelden
        </button>
      </div>
    )
  }
}
