import Container from '@app/components/container'
import { PersonDetail } from './components/person-detail'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { PERSON_DETAIL_QUERY } from '@app/graphql/cms/person-detail.query'
import { notFound } from 'next/navigation'

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

  return (
    <Container>
      <PersonDetail person={data.person} />
    </Container>
  )
}
