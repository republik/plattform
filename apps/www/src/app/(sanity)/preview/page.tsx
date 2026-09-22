import { css } from '@republik/theme/css'

export default function PreviewHomePage() {
  return (
    <div
      className={css({
        display: 'grid',
        placeContent: 'center',
        gap: '2',
        p: '16',
        textAlign: 'center',
        width: '100vw',
        height: '100vh',
      })}
    >
      <p className={css({ fontSize: '3xl' })}>👋</p>
      <p className={css({ fontSize: 'xl', fontWeight: 'medium' })}>
        Willkommen zur Studio-Vorschau
      </p>
      <p>
        Bitte wähle ein Dokument in der Produktionsansicht, um die Vorschau zu
        starten.
      </p>
    </div>
  )
}
