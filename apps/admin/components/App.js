import Head from 'next/head'
import { withRouter } from 'next/router'
import { fontFamilies } from '@project-r/styleguide'
import { useMe } from '../lib/useMe'

const App = ({ router, children }) => {
  useMe()

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
