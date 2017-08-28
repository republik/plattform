import React from 'react'
import Head from 'next/head'
import { NarrowContainer } from '@project-r/styleguide'

import 'glamor/reset'

export default ({ children, raw }) =>
  <main>
    <Head>
      <title>Project R — Mauka</title>
    </Head>
    {raw
      ? children
      : (
        <NarrowContainer>
          <div style={{padding: '20px 0'}}>
            {children}
          </div>
        </NarrowContainer>
      )
    }
  </main>
