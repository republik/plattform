import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import { UNELIGIBLE_RECEIVER_MEMBERSHIPS } from '@app/app/(campaign)/campaign-receiver/receiver-config'
import { UserInviterProfileInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

const SenderProfile = ({
  portrait,
  children,
}: {
  portrait?: string
  children: ReactNode
}) => {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'row',
        gap: '4',
        alignItems: 'center',
        // background: 'primary',
        // color: 'pageBackground',
        // borderBottom: '2px solid token(colors.primary)',
        // borderTop: '2px solid token(colors.primary)',
        // p: '2',
        // borderRadius: '5px',
        maxW: 600,
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
            className={css({
              borderRadius: '4px',
              // borderWidth: '2px',
              // borderColor: 'primary',
              // borderStyle: 'solid',
              boxShadow: 'sm',
              height: '4rem',
              width: '4rem',
              // width: { base: '4.5rem', md: '4rem' },
              // height: { base: '4.5rem', md: '4rem' },
            })}
            alt='Portrait'
            src={portrait}
            width={96}
            height={96}
            unoptimized
          />
        </div>
      )}
      <div
        className={css({
          flex: '0 1 auto',
          fontSize: { base: 'xl', md: '2xl' },
          textWrap: 'balance',
          '& em': {
            textStyle: 'sansSerifBold',
          },
        })}
      >
        <p>{children}</p>
      </div>
    </div>
  )
}

const CTA = ({ href }: { href: string }) => {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2',
        position: 'sticky',
        bottom: '0',
        pb: '4',
        pt: '16',
        backgroundGradient: 'stickyBottomPanelBackground',
        width: 'full',
      })}
    >
      <Link
        className={css({
          background: 'contrast',
          color: 'text.inverted',
          px: '6',
          py: '3',
          borderRadius: '3px',
          fontWeight: 'medium',
          cursor: 'pointer',
          textDecoration: 'none',
          textAlign: 'center',
          display: 'block',
          // width: 'full',
          _hover: {},
        })}
        href={href}
      >
        Wählen Sie Ihren Einstiegspreis
      </Link>
      <p className={css({ fontSize: 'base' })}> ab CHF 120 für ein Jahr</p>
    </div>
  )
}

export default async function Page({ params }) {
  const { data } = await getClient().query({
    query: UserInviterProfileInfoDocument,
    variables: { accessToken: params.code },
  })

  const { sender } = data

  const isEligible = !UNELIGIBLE_RECEIVER_MEMBERSHIPS.includes(
    data.me?.activeMembership.type.name,
  )

  if (!isEligible) {
    return redirect('/campaign-sender')
  }

  // if (!sender) {
  //   return <div>code hat nicht gefunzt</div>
  // }

  if (sender && data.me && sender?.id === data.me?.id) {
    return redirect('/campaign-sender')
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
          alignItems: 'stretch',
          gap: '8',
        })}
      >
        {sender ? (
          <div>
            <SenderProfile portrait={sender.portrait}>
              <>
                <em>
                  {sender.firstName} {sender.lastName}
                </em>{' '}
                hat Sie eingeladen, die Republik zu unterstützen.
              </>
            </SenderProfile>
          </div>
        ) : (
          <p>Machen Sie mit bei der Republik, denn das ist super cool!</p>
        )}

        {/* <p>
          Die Republik ist ein unabhängiges, Leserinnen finanziertes
          Onlinemagazin.
        </p>
        <p>
          Mit Ihrer Unterstützung decken wir staatliche Überwachung auf, ordnen
          das aktuelle Geschehen ein, fragen nach und führen den höflichsten
          Debattenraum der Schweiz – und vieles mehr.
        </p> */}

        <p>
          Die Republik ist ein digitales Magazin für Politik, Wirtschaft,
          Gesellschaft und Kultur. Unabhängig und werbefrei – finanziert von
          seinen Leserinnen und Lesern.
        </p>
        <p>
          In der Republik erwarten Sie von Montag bis Samstag Beiträge zum Lesen
          und Hören - von professionellen Sprecherinnen vorgelesen. Wir nehmen
          uns die nötige Zeit, um aktuelle Themen und Fragen für Sie angemessen
          und sorgfältig zu recherchieren, zu erzählen – und alle Fakten zu
          überprüfen.
        </p>
        <p>
          Damit Sie einen klaren Kopf behalten, mutig handeln und klug
          entscheiden können.
        </p>
        <CTA href={`${params.code}/angebot`} />

        {/* <CTA href={`${params.code}/angebot`} /> */}
      </div>
    </>
  )
}
