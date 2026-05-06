'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useMe } from '@/lib/useMe'
import { setUser as setSentryUser } from '@sentry/nextjs'

const App = ({ children }) => {
  const { me } = useMe()
  const pathname = usePathname()
  setSentryUser(me?.id ? { id: me.id } : null)

  useEffect(() => {
    document.title = `${pathname?.replace('/', '') ?? ''} – Admin`
  }, [pathname])

  return <main>{children}</main>
}

export default App
