'use client'
import { css } from '@app/styled-system/css'
import { Cursor, useTypewriter } from 'react-simple-typewriter'

export const Typewriter = ({ words }: { words: string[] }) => {
  const [text] = useTypewriter({
    words,
    loop: true,
    typeSpeed: 80,
    delaySpeed: 5000,
  })

  return (
    <>
      {text}
      <span
        className={css({
          '& > span': {
            // Override default cursor position
            position: 'static',
          },
        })}
      >
        <Cursor />
      </span>
    </>
  )
}
