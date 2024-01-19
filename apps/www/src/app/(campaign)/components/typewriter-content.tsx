import { Typewriter } from './typewriter'
import { css } from '@app/styled-system/css'

const words = ['Die Republik', 'Unabhängigen Journalismus', 'Gute Witze']

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
        {longestWord} gibt es, weil Sie etwas dafür tun
      </div>
    </div>
  )
}
