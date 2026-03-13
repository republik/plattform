import { MeDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@/lib/apollo/client-server'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'

export default async function AdminLayout({ children }: PropsWithChildren) {
  const client = await getClient()

  const { data } = await client.query({
    query: MeDocument,
  })

  if (!data?.me?.roles.includes('supporter')) {
    redirect('/login')
  }

  return <>{children}</>
}
