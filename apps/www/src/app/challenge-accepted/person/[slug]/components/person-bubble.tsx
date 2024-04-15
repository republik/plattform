import { PersonBubbleForce } from '@app/app/challenge-accepted/person/[slug]/components/person-bubble-graphic'
import { ChallengeAcceptedPersonListDocument } from '#graphql/cms/__generated__/gql/graphql'
import { getCMSClient } from '@app/lib/apollo/cms-client'

export async function PersonBubble() {
  const { data } = await getCMSClient().query({
    query: ChallengeAcceptedPersonListDocument,
    context: {
      fetchOptions: {
        next: {
          tags: ['challenge-accepted'],
        },
      },
    },
  })

  return <PersonBubbleForce people={data.people} />
}
