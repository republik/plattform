import { Logo } from '@app/app/(campaign)/components/logo'
import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import { css } from '@app/styled-system/css'
import { Metadata } from 'next'
import Link from 'next/link'

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

export const metadata: Metadata = {
  title: `Jemand lädt Sie ein, die Republik mit einem Abo zu unterstützen.`,
  description: 'Bis zum 31. März 2024 ab CHF 120 für ein Jahr.',
  robots: 'noindex',
}

export default async function Page() {
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
        <CTA href='/jetzt/angebot' />
      </div>
    </>
  )
}
