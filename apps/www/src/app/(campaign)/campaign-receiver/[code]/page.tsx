import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import Container from '@app/components/container'
import { UserInviterProfileInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import Image from 'next/image'
import Link from 'next/link'

const SenderProfile = ({
  portrait,
  text,
}: {
  portrait?: string
  text: string
}) => {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'row',
        gap: '4',
      })}
    >
      {portrait && (
        <div
          style={{
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <Image
            alt='Portrait'
            src={portrait}
            width={96}
            height={96}
            unoptimized
          />
        </div>
      )}
      <div className={css({ flex: '0 1 auto' })}>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default async function Page({ params }) {
  const { data } = await getClient().query({
    query: UserInviterProfileInfoDocument,
    variables: { accessToken: params.code },
  })

  const { sender } = data

  const isEligible = !['ABO', 'YEARLY_ABO', 'BENEFACTOR_ABO'].includes(
    data.me?.activeMembership.type.name,
  )

  if (!isEligible) {
    return <div>Noin, du hast schon ein Abo :P</div>
  }

  // if (!sender) {
  //   return <div>code hat nicht gefunzt</div>
  // }

  if (sender && data.me && sender?.id === data.me?.id) {
    return <div>das bin ja iiich</div>
  }

  return (
    <>
      <h1
        className={css({
          textStyle: 'campaignHeading',
          mt: '8-16',
          pr: '16',
        })}
      >
        <TypewriterContent />
      </h1>
      <div
        className={css({
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8',
        })}
      >
        {sender ? (
          <div>
            <SenderProfile
              portrait={sender.portrait}
              text={`${sender.firstName} ${sender.lastName} hat Sie eingeladen, Teil Republik zu werden.`}
            />
          </div>
        ) : (
          <p>Machen Sie mit bei der Republik, denn das ist super cool!</p>
        )}

        <p>
          Hier sollte noch ein mega inspiriender Text stehen, wo auch gesagt
          wird, dass man seinen eigenen Preis wählen kann und so.
        </p>
      </div>

      <div
        className={css({
          position: 'sticky',
          bottom: 0,
          width: 'full',
          py: '8',
          background: 'pageBackground',
        })}
      >
        <Link
          className={css({
            background: 'contrast',
            color: 'text.inverted',
            p: '4',
            borderRadius: '5px',
            fontWeight: 'medium',
            cursor: 'pointer',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block',
            width: 'full',
            _hover: {},
          })}
          href={`${params.code}/angebot?price=240`}
        >
          Angebot wählen
        </Link>
      </div>
    </>
  )
}
