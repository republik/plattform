'use client'
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
      <Cursor />
    </>
  )
}
