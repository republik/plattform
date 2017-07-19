import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import Head from 'next/head'
import {
  fontFamilies
} from '@project-r/styleguide'

export default ({ children }: any) =>
  <main>
    <Head>
      <title>Project R — Admin Interface</title>
      <meta
        name="viewport"
        content="initial-scale=1.0, width=device-width"
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
