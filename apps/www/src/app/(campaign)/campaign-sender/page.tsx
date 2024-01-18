import { ShareImage } from '@app/components/share/share-image'
import Container from '@app/components/container'
import { Share } from '@app/components/share/share'
import { UserInviteLinkInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { hstack, vstack } from '@app/styled-system/patterns'
import Image from 'next/image'
import Link from 'next/link'
import { IconDownload, IconShare } from '@republik/icons'
import { css } from '@app/styled-system/css'

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
        <div
          className={css({
            display: 'flex',
            gap: '8',
          })}
        >
          <div className={css({ overflow: 'hidden', width: 200 })}>
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
          </div>
          <div className={vstack({ gap: '4', alignItems: 'flex-start' })}>
            <Share
              url={`${process.env.NEXT_PUBLIC_BASE_URL}${url}`}
              title='Link teilen'
              emailSubject=''
            >
              <div
                className={hstack({
                  gap: '2',
                  color: 'text',
                  textStyle: 'sansSerifBold',
                  fontSize: 'm',
                  cursor: 'pointer',
                  _hover: {
                    color: 'contrast',
                  },
                })}
              >
                <IconShare size={20} /> Link teilen
              </div>
            </Share>
            <ShareImage imageSrc={`${url}/share-image`}>
              <div
                className={hstack({
                  gap: '2',
                  color: 'text',
                  textStyle: 'sansSerifBold',
                  fontSize: 'm',
                  cursor: 'pointer',
                  _hover: {
                    color: 'contrast',
                  },
                })}
              >
                <IconShare size={20} /> Bild teilen
              </div>
            </ShareImage>
            <Link href={`${url}/share-image`} download={'share-image.png'}>
              <div
                className={hstack({
                  gap: '2',
                  color: 'text',
                  textStyle: 'sansSerifBold',
                  fontSize: 'm',
                  cursor: 'pointer',
                  _hover: {
                    color: 'contrast',
                  },
                })}
              >
                <IconDownload size={20} /> Bild herunterladen
              </div>
            </Link>
          </div>
        </div>
        <p>
          Du hast schon {data.me?.futureCampaignAboCount} Leute eingeladen 🎉
        </p>
      </Container>
    </div>
  )
}
