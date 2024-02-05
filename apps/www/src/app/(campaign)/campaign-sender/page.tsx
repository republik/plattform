import { CampaignProgress } from '@app/app/(campaign)/components/campaign-progress'
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
import { redirect } from 'next/navigation'

const shareButtonStyle = hstack({
  gap: '2',
  // color: 'text',
  textStyle: 'sansSerifBold',
  fontSize: 'm',
  width: 'full',
  justifyContent: 'center',

  background: 'primary',
  color: 'pageBackground',
  px: '4',
  py: '3',
  borderRadius: '4px',
  border: '2px solid token(colors.primary)',

  cursor: 'pointer',
  _hover: {
    background: 'pageBackground',
    color: 'primary',
  },
})

export default async function Page() {
  const { data } = await getClient().query({
    query: UserInviteLinkInfoDocument,
  })

  const url = `/campaign-receiver/${data.me?.accessToken}`

  if (!data.me) {
    return redirect('/anmelden')
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

        {/* <p>
          {' '}
          <strong>
            Nice! Sie haben schon {data.me?.futureCampaignAboCount} Leute
            eingeladen 🎉
          </strong>
        </p> */}
        <p>
          Lassen Sie uns diese Verantwortung auf mehrere Schultern verteilen:
          Bis zum 31. März suchen wir 1’000 neue Unterstützer. Gemeinsam haben
          wir es schon soweit geschafft:
        </p>

        <div>
          <CampaignProgress />
        </div>

        <h2 className={css({ textStyle: 'campaignHeading' })}>
          Helfen Sie mit!
        </h2>
        <p>
          Teilen Sie Ihren persönlichen Link, damit Ihre Bekannten den Weg in
          die Verlagsetage finden. Das lohnt sich doppelt: Wenn jemand über
          Ihren Link ein neues Abo abschliesst, verlängern wir Ihres um einen
          Monat.
        </p>

        <div
          className={css({
            display: 'grid',
            gap: '8',
            gridTemplateColumns: `repeat(auto-fit, minmax(300px, auto))`,
          })}
        >
          <div
            className={css({
              background: 'overlay',
              borderRadius: '4px',
              py: '3',
              px: '4',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 'medium',
              fontSize: 'xl',
              border: '2px solid token(colors.divider)',
              // maxWidth: 300,
            })}
          >
            {`${process.env.NEXT_PUBLIC_BASE_URL}${url}`}
          </div>
          <Share
            url={`${process.env.NEXT_PUBLIC_BASE_URL}${url}`}
            title='Link teilen'
            emailSubject=''
          >
            <div className={shareButtonStyle}>
              <IconShare size={20} />
              Link teilen
            </div>
          </Share>
        </div>

        <p>
          Oder teilen Sie Ihren persönliches Kampagnen-Bild auf Social Media.
          Denn das ist super und blah blah blah, so machen Sie das nämlich:
          Lalalala.
        </p>

        <div
          className={css({
            display: 'grid',
            gap: '8',
            gridTemplateColumns: `repeat(auto-fit, minmax(300px, auto))`,
          })}
        >
          <div
            className={css({
              background: 'overlay',
              borderRadius: '4px',
              p: '4',
              border: '2px solid token(colors.divider)',
              width: 'full',
            })}
          >
            <Image
              alt='Kampagnenbild'
              src={`${url}/share-image`}
              className={css({
                width: '100%',
                borderRadius: '2px',
                // maxWidth: 300,
              })}
              width={1080}
              height={1920}
              unoptimized
            />
          </div>
          <div
            className={vstack({
              gap: '4',
              alignItems: 'stretch',
            })}
          >
            <ShareImage imageSrc={`${url}/share-image`}>
              <div className={shareButtonStyle}>
                {/* <IconShare size={20} />  */}Bild teilen
              </div>
            </ShareImage>
            <Link
              className={css({ textDecoration: 'none' })}
              href={`${url}/share-image`}
              download={'share-image.png'}
            >
              <div className={shareButtonStyle}>
                <IconDownload size={20} />
                Bild herunterladen
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}
