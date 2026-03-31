'use client'
import { Card, CardTitle } from '@/components/card'
import { UserProfileDocument } from '@/graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { EditUserDetails } from '../user-details'
import { EditUserEmail } from '../user-email'

export default function SubscriptionsPage() {
  const { userId } = useParams()

  const { data } = useQuery(UserProfileDocument, {
    variables: {
      id: userId,
    },
    skip: !userId,
  })

  if (!data?.user) return null

  return (
    <>
      <Card>
        <CardTitle>E-Mail</CardTitle>
        <EditUserEmail userId={userId} email={data?.user?.email} />
      </Card>
      <Card>
        <CardTitle>Personalien</CardTitle>
        <EditUserDetails userId={userId} values={data?.user} />
      </Card>
    </>
  )
}
