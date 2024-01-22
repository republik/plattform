'use client'

import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import useTimeout from 'src/lib/useTimeout'

const REDIRECT_TIMEOUT = 200 // ms
const SHOWLINK_TIMEOUT = 3000 // ms

export default function Goto() {
  const gotoPathname = usePathname()
  const gotoSearchParams = useSearchParams()
  const [showLink, setShowLink] = useState(false)

  // Parse gotoPathname into a fully qualified URL, using NEXT_PUBLIC_FRONTEND_BASE_URL
  const targetUrl = new URL(
    gotoPathname,
    process.env.NEXT_PUBLIC_FRONTEND_BASE_URL,
  )

  // Copy searchParams into target URL
  targetUrl.search = gotoSearchParams.toString()

  // Forward user to targetUrl after REDIRECT_TIMEOUT ms
  useTimeout(
    () => window.location.replace(targetUrl.toString()),
    REDIRECT_TIMEOUT,
  )

  // Show a link to user SHOWLINK_TIMEOUT ms
  useTimeout(() => setShowLink(true), SHOWLINK_TIMEOUT)

  if (showLink) {
    return (
      <a
        href={targetUrl.toString()}
        className='text-primary hover:text-primary-hover'
      >
        Klicken Sie hier um fortzufahren
      </a>
    )
  }

  return <>Leite weiter …</>
}
