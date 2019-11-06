import React from 'react'
import Head from 'next/head'
import { fontFamilies } from '@project-r/styleguide'
import { css } from 'glamor'
import withT from '../../lib/withT'

import Header from './Header'
import Nav from './Nav'
import Body from './Body'
import Me from './Me'

import 'glamor/reset'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

css.global('body', {
  fontFamily: fontFamilies.sansSerifRegular
})

const Frame = ({ t, children }) => (
  <main>
    <Head>
      <title>Project R – {t('app/name')}</title>
    </Head>
    {children}
  </main>
)

const FrameWithT = withT(Frame)

FrameWithT.Header = Header
FrameWithT.Nav = Nav
FrameWithT.Body = Body
FrameWithT.Me = Me

export default FrameWithT
