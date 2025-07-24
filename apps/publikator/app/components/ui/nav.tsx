'use client'

import Link from 'next/link'
import { Flex, Link as RadixLink } from '@radix-ui/themes'
import Logo from '../../../public/static/logo.svg'
import Image from 'next/image'
import { useSearchParams, usePathname } from 'next/navigation'

const Nav = () => {
  const searchParams = useSearchParams()
  const query = Object.fromEntries(searchParams.entries())
  const pathname = usePathname()
  const views = [
    { pathname: '/', label: 'Dokumente' },
    { pathname: '/', view: 'templates', label: 'Vorlagen' },
    { pathname: '/', view: 'calendar', label: 'Wochenvorschau' },
    { pathname: '/authors', label: 'Autoren' },
  ]
  return (
    <Flex
      justify='start'
      align='center'
      p='4'
      gap='4'
      style={{ borderBottom: '1px solid var(--accent-4)' }}
    >
      <Flex
        p='2'
        align='center'
        justify='center'
        style={{
          backgroundColor: 'var(--accent-12)',
          borderRadius: 'var(--radius-3)',
        }}
      >
        <Image src={Logo} alt='Logo' width={20} height={20} />
      </Flex>
      <Flex gap='4'>
        {views.map((view) => (
          <RadixLink
            asChild
            key={view.label}
            weight='medium'
            highContrast={pathname === view.pathname}
          >
            <Link
              href={{
                pathname: view.pathname,
                query: { ...query, view: view.view || null },
              }}
            >
              {view.label}
            </Link>
          </RadixLink>
        ))}
      </Flex>
    </Flex>
  )
}

export default Nav
