'use client'

import { useEffect } from 'react'

type GotoProps = {
  url: string
}

export default function Goto(props: GotoProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.replace(props.url)
    }, 1000)
    return () => clearTimeout(timer)
  })

  return <p>Einen Augenblick, bitte!</p>
}
