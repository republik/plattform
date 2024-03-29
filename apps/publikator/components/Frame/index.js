import Head from 'next/head'
import { fontFamilies } from '@project-r/styleguide'
import { css } from 'glamor'
import withT from '../../lib/withT'

import Header from './Header'
import Nav from './Nav'
import Body from './Body'
import Me from './Me'

import 'glamor/reset'
import { useMe } from '../../lib/useMe'
import { setUser as setSentryUser } from '@sentry/nextjs'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

css.global('body', {
  fontFamily: fontFamilies.sansSerifRegular,
})

const Frame = ({ t, children }) => {
  const { me } = useMe()
  setSentryUser(me?.id ? { id: me.id } : null)

  return (
    <main>
      <Head>
        <title>{t('app/name')}</title>
      </Head>
      {children}
    </main>
  )
}

const FrameWithT = withT(Frame)

FrameWithT.Header = Header
FrameWithT.Nav = Nav
FrameWithT.Body = Body
FrameWithT.Me = Me

export default FrameWithT
