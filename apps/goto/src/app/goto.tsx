'use client'

import { useState } from 'react'
import useTimeout from 'src/lib/useTimeout'

type GotoProps = {
  url: string
}

const REDIRECT_TIMEOUT = 200
const SHOWLINK_TIMEOUT = REDIRECT_TIMEOUT * 10

export default function Goto(props: GotoProps) {
  const [showLink, setShowLink] = useState(false)

  useTimeout(
    () => {
      window.location.replace(props.url)
    },
    props.url ? REDIRECT_TIMEOUT : null,
  )

  useTimeout(
    () => {
      setShowLink(true)
    },
    props.url ? SHOWLINK_TIMEOUT : null,
  )

  if (showLink) {
    return (
      <a href={props.url} className='text-primary hover:text-primary-hover'>
        Klicken Sie hier um fortzufahren
      </a>
    )
  }

  return <>Leite weiter …</>
}
