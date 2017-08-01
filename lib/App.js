import React from 'react'
import Head from 'next/head'
import { fontFamilies } from '@project-r/styleguide'

export default ({ children }) =>
  <main>
    <Head>
      <title>Project R — Haku</title>
      <meta
        name='viewport'
        content='initial-scale=1.0, width=device-width'
      />
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
