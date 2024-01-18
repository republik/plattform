import { ImageShareButton } from '@app/app/(campaign)/campaign-sender/image-share-button'
import Container from '@app/components/container'
import { UserInviteLinkInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import Image from 'next/image'
import Link from 'next/link'

export default async function Page() {
  const { data } = await getClient().query({
    query: UserInviteLinkInfoDocument,
  })

  const url = `/campaign-receiver/${data.me?.accessToken}`

  if (!data.me) {
    return <div>Eh, bitte anmelden</div>
  }

  return (
    <div>
      <Container>
        Hey, du kannst jemanden einladen mit diesem Link:{' '}
        <Link href={url}>
          {process.env.NEXT_PUBLIC_BASE_URL}
          {url}
        </Link>
        <Image
          alt='sharebildli'
          src={`${url}/share-image`}
          width={200}
          height={400}
          unoptimized
        />
        <ImageShareButton imageSrc={`${url}/share-image`} />
        <p>
          Du hast schon {data.me?.futureCampaignAboCount} Leute eingeladen 🎉
        </p>
      </Container>
    </div>
  )
}
