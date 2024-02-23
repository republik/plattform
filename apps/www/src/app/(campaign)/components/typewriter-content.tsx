import { Typewriter } from './typewriter'
import { css } from '@app/styled-system/css'

const words = [
  'Die Republik',
  'Unabhängigen Journalismus',
  'Eine höfliche Streitkultur',
  'Vertrauenswürdige Berichterstattung',
  'Kritische Nachfragen',
  'Die vierte Gewalt',
  'Kritik der Macht',
  'Werbefreiheit',
  'Innovativen Klimajournalismus',
  'Meinungsvielfalt',
  'Sorgfältige Recherchen',
  'Transparenz in der Medienbranche',
  'Vorgelesene Beiträge',
  'Ein wöchentliches Nachrichtenbriefing',
  'Texte mit einer Lesedauer von über 15 Minuten',
]

const longestWord = words.reduce((longest, word) => {
  return word.length > longest.length ? word : longest
}, '')

export const TypewriterContent = () => {
  return (
    <div className={css({ display: 'grid' })}>
      <div
        className={css({
          gridColumnStart: 1,
          gridColumnEnd: 1,
          gridRowStart: 1,
          gridRowEnd: 1,
        })}
      >
        <Typewriter words={words} /> gibt es, weil Sie etwas dafür tun
      </div>
      <div
        aria-hidden
        className={css({
          gridColumnStart: 1,
          gridColumnEnd: 1,
          gridRowStart: 1,
          gridRowEnd: 1,
          visibility: 'hidden',
        })}
      >
        {longestWord}&nbsp; gibt es, weil Sie etwas dafür tun
      </div>
    </div>
  )
}
