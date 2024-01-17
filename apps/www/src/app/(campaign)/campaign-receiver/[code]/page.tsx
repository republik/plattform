import { UserInviterProfileInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'

export default async function Page({ params }) {
  const { data } = await getClient().query({
    query: UserInviterProfileInfoDocument,
    variables: { accessToken: params.code },
  })

  const { sender } = data

  const isEligible = !['ABO', 'YEARLY_ABO', 'BENEFACTOR_ABO'].includes(
    data.me?.activeMembership.type.name,
  )

  if (!isEligible) {
    return <div>Noin, du hast schon ein Abo :P</div>
  }

  if (!sender) {
    return <div>code hat nicht gefunzt</div>
  }

  if (sender?.id === data.me?.id) {
    return <div>das bin ja iiich</div>
  }

  return (
    <div>
      Hey, mach mit! Du wurdest eingeladen von{' '}
      <strong>{data.sender?.firstName}</strong>
    </div>
  )
}
