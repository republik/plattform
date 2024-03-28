import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import { CTA } from '@app/app/(campaign)/jetzt/call-to-action'
import { css } from '@republik/theme/css'

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
