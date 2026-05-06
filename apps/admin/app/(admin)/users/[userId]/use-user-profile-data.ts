import { UserProfileDocument } from '@/graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'

export function useUserProfileData() {
  const { userId } = useParams<{ userId: string }>()
  const { data } = useQuery(UserProfileDocument, {
    variables: {
      id: userId,
    },
    skip: !userId,
  })

  return data?.user
}
