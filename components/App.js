import React from 'react'
import Head from 'next/head'
import { fontFamilies } from '@project-r/styleguide'

const App = ({ children }) => <main>
  <Head>
    <title>Admin</title>
    <meta
      name="viewport"
      content="initial-scale=1.0, width=device-width"
    />
    <style>{`
      html, body {
        padding: 0;
        margin: 0;
        font-family: ${
          fontFamilies.sansSerifRegular
        }
      }
    `}</style>
  </Head>
  {children}
</main>;

export default App;
