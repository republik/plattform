'use client'
import { FormCard } from '@/components/form-card'
import { UserProfileDocument } from '@/graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
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
    <div className={css({})}>
      <FormCard>
        <h2>E-Mail</h2>
        <EditUserEmail userId={userId} email={data?.user?.email} />
      </FormCard>
      <FormCard>
        <h2>Personalien</h2>
        <EditUserDetails userId={userId} values={data?.user} />
      </FormCard>
    </div>
  )
}
