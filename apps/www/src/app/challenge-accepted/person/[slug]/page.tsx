import Container from '@app/components/container'
import { PersonDetail } from './components/person-detail'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { PERSON_DETAIL_QUERY } from '@app/graphql/cms/person-detail.query'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMe } from '@app/lib/auth/me'

export default async function Page({
  params: { slug },
}: {
  params: { slug: string }
}) {
  const { data } = await getCMSClient().query({
    query: PERSON_DETAIL_QUERY,
    variables: { slug },
  })

  if (!data.person) {
    notFound()
  }

  const me = await getMe()

  return (
    <>
      <Link href='/challenge-accepted'>Challenge Accepted Übersicht</Link>
      <Container>
        <PersonDetail
          person={data.person}
          isMember={
            me?.roles && Array.isArray(me.roles) && me.roles.includes('member')
          }
        />
      </Container>
    </>
  )
}
