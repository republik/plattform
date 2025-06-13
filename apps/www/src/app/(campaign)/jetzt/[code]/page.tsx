import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import { CTA } from '@app/app/(campaign)/jetzt/call-to-action'
import { css } from '@republik/theme/css'
import { Metadata } from 'next'
import Image from 'next/image'
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

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  const data = await getInviteeData(params)

  const senderName = data.sender?.firstName
    ? `${data.sender.firstName}${
        data.sender.lastName ? ' ' + data.sender.lastName : ''
      }`
    : 'Jemand'

  return {
    title: `${senderName} lädt Sie ein, die Republik mit einem Abo zu unterstützen.`,
  }
}

export default async function Page(props) {
  const params = await props.params;
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
        <CTA href={`/jetzt/${params.code}/angebot`} />
      </div>
    </>
  )
}
