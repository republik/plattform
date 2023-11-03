import { css } from 'glamor'
import Head from 'next/head'

import compose from 'lodash/flowRight'
import { useRouter } from 'next/router'

import withMe from '../lib/apollo/withMe'
import { useTranslation } from '../lib/withT'
import withInNativeApp from '../lib/withInNativeApp'
import { intersperse } from '../lib/utils/helpers'

import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  LOGO_WIDTH,
  LOGO_PADDING,
  LOGO_WIDTH_MOBILE,
  LOGO_PADDING_MOBILE,
} from '../components/constants'

import AuthNotification from '../components/Auth/Notification'

import { CURTAIN_MESSAGE, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import {
  Interaction,
  NarrowContainer,
  Logo,
  A,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import Link from 'next/link'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { IconClose } from '@republik/icons'

const styles = {
  bar: css({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    height: HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      height: HEADER_HEIGHT,
    },
    '@media print': {
      position: 'absolute',
      backgroundColor: 'transparent',
    },
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  }),
  padHeader: css({
    // minus 1px for first sticky hr from header
    // - otherwise there is a jump when scroll 0 and opening hamburger
    paddingTop: HEADER_HEIGHT_MOBILE - 1,
    [mediaQueries.mUp]: {
      paddingTop: HEADER_HEIGHT - 1,
    },
  }),
  close: css({
    position: 'fixed',
    right: 15,
    top: 5,
  }),
  logoRepublik: css({
    position: 'relative',
    display: 'inline-block',
    padding: LOGO_PADDING_MOBILE,
    width: LOGO_WIDTH_MOBILE + LOGO_PADDING_MOBILE * 2,
    [mediaQueries.mUp]: {
      padding: LOGO_PADDING,
      width: LOGO_WIDTH + LOGO_PADDING * 2,
    },
    verticalAlign: 'middle',
  }),
  logoProjectR: css({
    display: 'block',
    margin: '26px auto -16px',
    maxWidth: 520,
    textAlign: 'left',
  }),
  text: css({
    margin: '30px auto',
    maxWidth: 520,
    [mediaQueries.mUp]: {
      margin: '60px auto 120px',
    },
  }),
  link: css({
    marginTop: 20,
  }),
}

const hasCurtain = !!CURTAIN_MESSAGE

const { P } = Interaction

const fixAmpsInQuery = (rawQuery) => {
  let query = {}

  Object.keys(rawQuery).forEach((key) => {
    query[key.replace(/^amp;/, '')] = rawQuery[key]
  })

  return query
}

const Page = ({ me, inNativeApp }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { rawQuery } = router.query
  const [colorScheme] = useColorContext()
  const query = fixAmpsInQuery(rawQuery)
  const { context, type } = query

  const links = [
    me &&
      context === 'pledge' &&
      type !== 'token-authorization' && {
        pathname: '/konto',
        label: t('notifications/links/merci'),
      },
  ].filter(Boolean)

  const isProjectR = context === 'projectr'
  const logoTarget = [
    'token-authorization',
    // Deprecated (superseeded by "newsletter")
    'newsletter-subscription',
    // Deprecated (superseeded by "newsletter")
    // Workaround to handle "script" replacements in email clients
    'newsletter-subscript-disabledion',
    'newsletter',
  ].includes(type)
    ? '_blank'
    : undefined

  const logo = isProjectR ? (
    <a
      href='https://project-r.construction/'
      rel='noopener'
      target='_blank'
      {...styles.logoProjectR}
    >
      <img
        style={{ height: 50 }}
        src={`${CDN_FRONTEND_BASE_URL}/static/project_r_logo.png`}
      />
    </a>
  ) : hasCurtain ? (
    <div {...styles.logoRepublik}>
      <Logo />
    </div>
  ) : (
    <a href='/' target={logoTarget} {...styles.logoRepublik}>
      <Logo />
    </a>
  )

  const stickyBar = !isProjectR

  const hasRedirect = router.query.redirect

  return (
    <div>
      <Head>
        <title>{t('notifications/pageTitle')}</title>
        <meta name='robots' content='noindex' />
      </Head>
      <NarrowContainer>
        <div
          {...(stickyBar ? styles.bar : undefined)}
          {...colorScheme.set('borderBottomColor', 'divider')}
        >
          {logo}
        </div>
        {inNativeApp && !hasRedirect && (
          <Link href='/' passHref {...styles.close}>
            <IconClose {...colorScheme.set('fill', 'text')} size={32} />
          </Link>
        )}
        <div
          {...styles.text}
          {...(stickyBar ? styles.padHeader : undefined)}
          style={{
            marginTop: inNativeApp ? 15 : undefined,
          }}
        >
          <AuthNotification query={query} />
          {!hasCurtain && links.length > 0 && (
            <P {...styles.link}>
              {intersperse(
                links.map((link, i) => (
                  <Link
                    key={i}
                    href={{
                      pathname: link.pathname,
                      query: link.query,
                    }}
                    params={link.params}
                    passHref
                    legacyBehavior
                  >
                    <A>{link.label}</A>
                  </Link>
                )),
                () => ' – ',
              )}
            </P>
          )}
        </div>
      </NarrowContainer>
    </div>
  )
}

export default withDefaultSSR(compose(withMe, withInNativeApp)(Page))
