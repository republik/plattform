'use client'
import { MeDocument } from '@/graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import SignIn from './SignIn'
import SignOut from './SignOut'

export default function Me({ email }) {
  const { data } = useQuery(MeDocument)
  const me = data?.me
  return (
    <div>
      {me ? (
        <div>
          {me.name || me.email}
          <br />
          <SignOut />
        </div>
      ) : (
        <SignIn email={email} />
      )}
    </div>
  )
}
