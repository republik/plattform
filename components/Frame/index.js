import React from 'react'
import Head from 'next/head'
import { fontFamilies } from '@project-r/styleguide'
import { css } from 'glamor'
import withT from '../../lib/withT'

import 'glamor/reset'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

css.global('body', {
  fontFamily: fontFamilies.sansSerifRegular
})

const Index = ({ t, children }) =>
  <main>
    <Head>
      <title>Project R – {t('app/name')}</title>
    </Head>
    {children}
  </main>

export default withT(Index)
