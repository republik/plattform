import { UserInviterProfileInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'

export default async function Page({ params }) {
  const { data } = await getClient().query({
    query: UserInviterProfileInfoDocument,
    variables: { accessToken: params.code },
  })

  return (
    <div>
      Hey, mach mit! Du wurdest eingeladen von{' '}
      <strong>{data.sender?.firstName}</strong>
    </div>
  )
}
