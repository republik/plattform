import Head from 'next/head'
import { fontFamilies } from '@project-r/styleguide'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'

const App = ({ children }: { children: ReactNode }) => {
  const { pathname } = useRouter()
  const title = `${pathname.replace('/', '')} - Admin`

  return (
    <main>
      <Head>
        <title>{title}</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        <style>{`
      html, body {
        padding: 0;
        margin: 0;
        font-family: ${fontFamilies.sansSerifRegular}
      }
    `}</style>
      </Head>
      {children}
    </main>
  )
}

export default App
