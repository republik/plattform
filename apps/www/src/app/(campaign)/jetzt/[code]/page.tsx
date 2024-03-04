import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { Logo } from '@app/app/(campaign)/components/logo'
import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import { css } from '@app/styled-system/css'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
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
          px: '4',
          py: '3',
          borderRadius: '4px',
          fontWeight: 'medium',
          cursor: 'pointer',
          textDecoration: 'none',
          textAlign: 'center',
          display: 'block',
          border: '2px solid token(colors.contrast)',
          // width: 'full',
          _hover: {
            background: 'text.inverted',
            color: 'contrast',
          },
        })}
        href={href}
      >
        Wählen Sie Ihren Einstiegspreis
      </Link>
      <p className={css({ fontSize: 'base' })}> ab CHF 120 für ein Jahr</p>
      <div className={css({ pt: '2' })}>
        <Logo />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await getInviteeData(params)

  const senderName = data.sender?.firstName
    ? `${data.sender.firstName}${
        data.sender.lastName ? ' ' + data.sender.lastName : ''
      }`
    : 'Jemand'

  return {
    title: `${senderName} lädt Sie ein, die Republik mit einem Abo zu unterstützen.`,
    description: 'Bis zum 31. März 2024 ab CHF 120 für ein Jahr.',
    robots: 'noindex',
  }
}

export default async function Page({ params }) {
  const data = await getInviteeData(params)

  const { sender } = data

  return (
    <>
      <h1
        className={css({
          textStyle: 'campaignHeading',
          pr: '16',
        })}
      >
        <TypewriterContent external />
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
        {sender && (
          <div>
            <SenderProfile portrait={sender.portrait}>
              <>
                <em>
                  {sender.firstName} {sender.lastName}
                </em>{' '}
                hat Sie eingeladen, die Republik mit einem Abo zu unterstützen.
              </>
            </SenderProfile>
          </div>
        )}

        <p>
          Die Republik ist ein digitales Magazin für Politik, Wirtschaft,
          Gesellschaft und Kultur. Unabhängig und werbefrei – finanziert von
          seinen Leserinnen und Lesern.
        </p>
        <p>
          In der Republik erwarten Sie täglich 1 bis 3 Beiträge zum Lesen und
          Hören. Wir nehmen uns die nötige Zeit, um aktuelle Themen und Fragen
          für Sie angemessen und sorgfältig zu recherchieren, zu erzählen – und
          alle Fakten zu überprüfen.
        </p>
        <p>
          Damit Sie einen klaren Kopf behalten, mutig handeln und klug
          entscheiden können.
        </p>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
          })}
        >
          <h2
            className={css({
              fontWeight: 'bold',
            })}
          >
            Warum bestehende Abonnenten die Republik unterstützen:
          </h2>
          <ul
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '2',
              '&> li::before': {
                content: '"«"',
              },
              '&> li::after': {
                content: '"»"',
              },
            })}
          >
            <li>
              Die Beiträge helfen mir immer wieder, das chaotische Weltgeschehen
              besser einzuordnen, und unterstützen mich bei der Meinungsbildung.
            </li>
            <li>
              Unabhängiger Journalismus ist unter Druck. Es braucht Gegensteuer.
            </li>
            <li>
              Super Mischung aus Reportagen mit grossem Aktualitätsbezug, tolle
              Qualität und mutige neue Projekte wie das Klimalabor.
            </li>
            <li>
              Journalismus kostet. Und guten Journalismus will ich unterstützen.
            </li>
          </ul>
        </div>
        <CTA href={`${params.code}/angebot`} />

        {/* <CTA href={`${params.code}/angebot`} /> */}
      </div>
    </>
  )
}
