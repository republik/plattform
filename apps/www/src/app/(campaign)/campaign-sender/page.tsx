import { Typewriter } from '@app/app/(campaign)/components/typewriter'
import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import Container from '@app/components/container'
import { Share } from '@app/components/share/share'
import { ShareImage } from '@app/components/share/share-image'
import { UserInviteLinkInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import { hstack, vstack } from '@app/styled-system/patterns'
import { IconDownload, IconShare } from '@republik/icons'
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
    <Container>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '8',
          py: '8-16',
          fontSize: 'xl',
        })}
      >
        <h1 className={css({ textStyle: 'campaignHeading' })}>
          <TypewriterContent />
        </h1>
        <p>
          Wenn eine von 20 Verleger*innen einen neuen Mistreiter von der
          Republik überzeugt, ist unser unabhängiger Journalismus finanziert.
        </p>

        <h2 className={css({ textStyle: 'campaignHeading' })}>
          Helfen Sie mit!
        </h2>
        <p>
          Wenn Sie jemanden an Bord holen, schenken wir Ihnen einen Gratismonat
          Republik{' '}
          <strong>
            Nice! Sie haben schon {data.me?.futureCampaignAboCount} Leute
            eingeladen 🎉
          </strong>
        </p>

        <p>
          Teilen Sie Ihren persönlichen Link oder das Bild, mit dem eine neue
          Verlegerin die Republik für ein Jahr zu einem Preis, der für Sie fair
          erscheint abonnieren kann (ab CHF 120).
        </p>

        <div
          className={css({
            display: 'grid',
            gap: '8',
            gridTemplateColumns: `repeat(auto-fit, minmax(300px, auto))`,
          })}
        >
          <div className={css({ maxWidth: 300 })}>
            <Image
              alt='sharebildli'
              src={`${url}/share-image`}
              className={css({
                width: '100%',
                maxWidth: 300,
              })}
              width={200}
              height={400}
              unoptimized
            />
          </div>
          <div
            className={vstack({
              gap: '4',
              alignItems: 'flex-start',
            })}
          >
            <div
              className={css({
                background: 'overlay',
                borderRadius: '3px',
                p: '2',
                w: 'full',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 'medium',
              })}
            >
              {`${process.env.NEXT_PUBLIC_BASE_URL}${url}`}
            </div>
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
            <Link
              className={css({ textDecoration: 'none' })}
              href={`${url}/share-image`}
              download={'share-image.png'}
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
                <IconDownload size={20} /> Bild herunterladen
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}
