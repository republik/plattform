import Head from 'next/head'
import { withRouter } from 'next/router'
import { fontFamilies } from '@project-r/styleguide'
import { useMe } from '../lib/useMe'
import { setUser as setSentryUser } from '@sentry/nextjs'

const App = ({ router, children }) => {
  const { me } = useMe()
  setSentryUser(me?.id ? { id: me.id } : null)

  return (
    <main>
      <Head>
        <title>{router.pathname.replace('/', '')} – Admin</title>
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

export default withRouter(App)
