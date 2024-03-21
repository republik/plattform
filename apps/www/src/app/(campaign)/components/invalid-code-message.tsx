import { css } from '@app/styled-system/css'
import Link from 'next/link'

export const InvalidCodeMessage = () => {
  return (
    <>
      <p>Dieser Link ist leider ungültig.</p>
      <p>
        Vielleicht kennen Sie eine Republik-Verlegerin, die Sie einladen kann?
      </p>
      <p>
        Mit einem Probeabo können Sie die Republik ab sofort und{' '}
        <Link
          className={css({
            color: 'text',
          })}
          href='/probelesen'
        >
          kostenlos für 3 Wochen kennenlernen
        </Link>
        .
      </p>
      <p>
        Sie sind schon Verleger oder Verlegerin der Republik? Dann{' '}
        <Link
          className={css({
            color: 'text',
          })}
          href='/anmelden'
        >
          melden Sie sich an
        </Link>
        , um auf die Übersicht zu kommen.
      </p>
    </>
  )
}
