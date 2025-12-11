import { ForceOnboarding } from '@app/components/onboarding/force-onboarding'
import {
  A,
  Interaction,
  Logo,
  mediaQueries,
  NarrowContainer,
  useColorContext,
} from '@project-r/styleguide'
import { IconClose } from '@republik/icons'
import { css } from 'glamor'

import compose from 'lodash/flowRight'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter, withRouter } from 'next/router'

import AuthNotification from '../components/Auth/Notification'

import {
  HEADER_HEIGHT,
  LOGO_PADDING,
  LOGO_PADDING_MOBILE,
  LOGO_WIDTH,
  LOGO_WIDTH_MOBILE,
} from '../components/constants'
import { withDefaultSSR } from '../lib/apollo/helpers'

import withMe from '../lib/apollo/withMe'

import { CDN_FRONTEND_BASE_URL, CURTAIN_MESSAGE } from '../lib/constants'
import { intersperse } from '../lib/utils/helpers'
import withInNativeApp from '../lib/withInNativeApp'
import { useTranslation } from '../lib/withT'

const styles = {
  bar: css({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    height: HEADER_HEIGHT,
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
    paddingTop: HEADER_HEIGHT - 1,
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

const Page = ({ router: { query: rawQuery }, me, inNativeApp }) => {
  const { t } = useTranslation()
  const router = useRouter()
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
      rel='noreferrer'
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
    <ForceOnboarding>
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
    </ForceOnboarding>
  )
}

export default withDefaultSSR(
  compose(withRouter, withMe, withInNativeApp)(Page),
)
