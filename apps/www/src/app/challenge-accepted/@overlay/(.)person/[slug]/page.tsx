import { PersonDetail } from '@app/app/challenge-accepted/person/[slug]/components/person-detail'
import { PERSON_DETAIL_QUERY } from '@app/graphql/cms/person-detail.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { notFound } from 'next/navigation'
import Overlay from './components/overlay'
import Container from '@app/components/container'
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
  const isMember =
    me?.roles && Array.isArray(me.roles) && me.roles.includes('member')

  const personData: typeof data['person'] = {
    ...data.person,
    items: data.person.items.map((item) => {
      if (item.__typename !== 'EventRecord') {
        return item
      }
      return {
        ...item,
        signUpLink: isMember || item.isPublic ? item.signUpLink : undefined,
      }
    }),
  }

  return (
    <Overlay>
      <Container>
        <PersonDetail person={personData} isMember={isMember} />
      </Container>
    </Overlay>
  )
}
