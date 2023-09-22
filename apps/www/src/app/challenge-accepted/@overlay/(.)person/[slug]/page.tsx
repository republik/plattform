import { PersonDetail } from '@app/app/challenge-accepted/person/[slug]/components/person-detail'
import { PERSON_DETAIL_QUERY } from '@app/graphql/cms/person-detail.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { notFound } from 'next/navigation'
import Overlay from './components/overlay'
import Container from '@app/components/container'

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
    <Overlay>
      <Container>
        <PersonDetail person={data.person} />
      </Container>
    </Overlay>
  )
}
