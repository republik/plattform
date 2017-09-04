import React from 'react'
import Head from 'next/head'
import { NarrowContainer, fontFamilies } from '@project-r/styleguide'
import Header from './Header'
import { HEADER_HEIGHT } from './constants'
import { css } from 'glamor'

import 'glamor/reset'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

css.global('body', {
  fontFamily: fontFamilies.sansSerifRegular
})

export default ({ children, url, raw, nav }) =>
  <main>
    <Head>
      <title>Project R – Mauka</title>
    </Head>
    <Header url={url}>{nav}</Header>
    <div style={{paddingTop: HEADER_HEIGHT}}>
      {raw
        ? children
        : (
          <NarrowContainer>
            <div style={{paddingTop: 40, paddingBottom: 20}}>
              {children}
            </div>
          </NarrowContainer>
        )
      }
    </div>
  </main>
