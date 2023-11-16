import { PersonBubbleForce } from '@app/app/challenge-accepted/person/[slug]/components/person-bubble-graphic'
import { CHALLENGE_ACCEPTED_PERSON_LIST_QUERY } from '@app/graphql/cms/person-list.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'

export async function PersonBubble() {
  const { data } = await getCMSClient().query({
    query: CHALLENGE_ACCEPTED_PERSON_LIST_QUERY,
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
