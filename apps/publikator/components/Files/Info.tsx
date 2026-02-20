import { css } from 'glamor'
import { IconWarning } from '@republik/icons'

import { useColorContext } from '@project-r/styleguide'

const styles = {
  container: css({
    margin: '1rem 0 1rem 0',
    padding: '1rem',
    lineHeight: '1.5',
    fontSize: '0.75rem',
  }),
}

const Info: React.FC = () => {
  const [colorScheme] = useColorContext()

  return (
    <p {...styles.container} {...colorScheme.set('backgroundColor', 'alert')}>
      Dateien werden beim hochladen zunächst auf einem privaten Server bei
      Amazon AWS gespeichert. Sie werden erst öffentlich zugänglich, wenn Sie
      via den &quot;Veröffentlichen&quot;-Button veröffentlicht werden. . Für
      die Vorschau der Dateien wird ein temporärer öffentlicher Link erstellt.
      Wenn dieser im Dokument verwendet wird, kann das Dokument nicht publiziert
      werden. <br />
      <IconWarning
        fill='inherit'
        size='1.2em'
        style={{
          verticalAlign: 'baseline',
          marginRight: 6,
          marginBottom: '-0.2em',
        }}
      />{' '}
      <b>
        Es dürfen keine sensiblen Dateien (z.B. Whistleblowing-Daten,
        Nutzerdaten, Dokumente mit Passwörtern oder Kontaktdaten) hier
        hochgeladen werden.
      </b>
    </p>
  )
}

export default Info
