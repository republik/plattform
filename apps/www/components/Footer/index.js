import { useMemo } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Logo,
  mediaQueries,
  fontStyles,
  ColorContextProvider,
  useColorContext,
} from '@project-r/styleguide'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import { withSignOut } from '../Auth/SignOut'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { ZINDEX_FOOTER } from '../constants'

import SocialLinks from './SocialLinks'
import Address from './Address'
import { IconOpensource } from '@republik/icons'
import LightSwitch from './lightswitch'

const styles = {
  bg: css({
    '@media print': {
      display: 'none !important',
    },
    position: 'relative',
    zIndex: ZINDEX_FOOTER, // goes over sidebar
    backgroundColor: 'black',
    padding: '40px 15px',
    [mediaQueries.mUp]: {
      padding: '80px 40px',
    },
  }),
  content: css({
    maxWidth: 1230,
    margin: '0 auto',
  }),
  hr: css({
    border: 'none',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    marginBottom: 36,
  }),
  topRow: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row-reverse',
    marginBottom: 36,
  }),
  middleRow: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    marginBottom: 36,
    [mediaQueries.mUp]: {
      flexDirection: 'row-reverse',
    },
  }),
  nav: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    maxWidth: 780,
    flex: 1,
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  addressColumn: css({
    marginRight: 70,
  }),
  logo: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    height: '36px',
  }),
  since: css({
    ...fontStyles.sansSerifRegular14,
    display: 'none',
    alignSelf: 'flex-end',
    [mediaQueries.mUp]: {
      display: 'inline-block',
    },
  }),
  navList: css({
    display: 'flex',
    flexDirection: 'row',
    listStyleType: 'none',
    flexWrap: 'wrap',
    padding: 0,
    margin: 0,
    marginBottom: 32,
    [mediaQueries.mUp]: {
      flexDirection: 'column',
      marginBottom: 0,
      marginLeft: 8,
    },
    '& li': {
      ...fontStyles.sansSerifRegular16,
      marginTop: 8,
      marginRight: 22,
      [mediaQueries.mUp]: {
        marginRight: 0,
      },
    },
    '& li:first-child': {
      ...fontStyles.sansSerifRegular14,
      marginTop: 0,
      width: '100%',
      [mediaQueries.mUp]: {
        width: 'inherit',
      },
    },
  }),
  meta: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  }),
  devInfo: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
    alignSelf: 'flex-end',
  }),
}

const Footer = ({ t, me, signOut, isOnMarketingPage, hasActiveMembership }) => {
  const [colorScheme] = useColorContext()
  const {
    inNativeApp,
    inNativeAppVersion,
    inNativeAppBuildId,
    inNativeIOSApp,
  } = useInNativeApp()

  const navLinkStyle = useMemo(
    () =>
      css({
        ...fontStyles.sansSerifRegular16,
        color: colorScheme.getCSSColor('text'),
        textDecoration: 'none',
        '@media (hover)': {
          ':hover': {
            textDecoration: 'underline',
          },
        },
      }),
    [colorScheme],
  )

  const FooterNavLink = (props) => (
    <Link prefetch={false} {...props} legacyBehavior />
  )

  const router = useRouter()

  return (
    <div {...styles.bg}>
      <div {...styles.content}>
        <div {...styles.topRow}>
          <SocialLinks />
          {!isOnMarketingPage ? (
            <FooterNavLink href='/'>
              <a>
                <div {...styles.logo}>
                  <Logo {...colorScheme.set('fill', 'text')} height={20} />
                  <span
                    {...colorScheme.set('color', 'textSoft')}
                    {...styles.since}
                  >
                    {t('footer/since')}
                  </span>
                </div>
              </a>
            </FooterNavLink>
          ) : null}
        </div>
        <hr {...styles.hr} {...colorScheme.set('borderColor', 'divider')} />
        <div {...styles.middleRow}>
          <div {...styles.nav}>
            <ul {...styles.navList}>
              <li {...colorScheme.set('color', 'textSoft')}>
                {me ? `${t('footer/me/title')}` : `${t('footer/becomemember')}`}
              </li>
              {!!me && (
                <>
                  <li>
                    <FooterNavLink href='/konto'>
                      <a {...navLinkStyle}>{t('footer/me/signedIn')}</a>
                    </FooterNavLink>
                  </li>
                  <li>
                    <FooterNavLink href={`/~${me.username || me.id}`}>
                      <a {...navLinkStyle}>{t('footer/me/profile')}</a>
                    </FooterNavLink>
                  </li>
                </>
              )}
              {!inNativeIOSApp && (
                <>
                  <li>
                    <FooterNavLink href={process.env.NEXT_PUBLIC_SHOP_BASE_URL}>
                      <a {...navLinkStyle}>{t('footer/offers')}</a>
                    </FooterNavLink>
                  </li>
                  <li>
                    <FooterNavLink
                      href={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/geschenke`}
                    >
                      <a {...navLinkStyle}>{t('footer/me/give')}</a>
                    </FooterNavLink>
                  </li>
                  <li>
                    <FooterNavLink href='/abholen'>
                      <a {...navLinkStyle}>{t('footer/me/claim')}</a>
                    </FooterNavLink>
                  </li>
                </>
              )}

              {me && me.accessCampaigns.length > 0 && hasActiveMembership && (
                <li>
                  <FooterNavLink href='/teilen'>
                    <a {...navLinkStyle}>{t('footer/me/share')}</a>
                  </FooterNavLink>
                </li>
              )}
              {me ? (
                <li>
                  <a
                    {...navLinkStyle}
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      signOut()
                    }}
                  >
                    {t('footer/me/signOut')}
                  </a>
                </li>
              ) : (
                <li>
                  <FooterNavLink href='/anmelden'>
                    <a {...navLinkStyle}>{t('footer/signIn/alt')}</a>
                  </FooterNavLink>
                </li>
              )}
            </ul>
            <ul {...styles.navList}>
              <li {...colorScheme.set('color', 'textSoft')}>Republik</li>
              <li>
                <FooterNavLink href='/about'>
                  <a {...navLinkStyle}>{t('footer/about')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/format/jobs'>
                  <a {...navLinkStyle}>{t('footer/jobs')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/cockpit'>
                  <a {...navLinkStyle}>{t('nav/cockpit')}</a>
                </FooterNavLink>
              </li>
              {!inNativeIOSApp && (
                <li>
                  <FooterNavLink href='/faq'>
                    <a {...navLinkStyle}>{t('footer/me/faq')}</a>
                  </FooterNavLink>
                </li>
              )}
              <li>
                <a
                  {...navLinkStyle}
                  href='https://project-r.construction/'
                  rel='noreferrer'
                  target='_blank'
                >
                  {t('footer/about/projecR')}
                </a>
              </li>
            </ul>
            <ul {...styles.navList}>
              <li {...colorScheme.set('color', 'textSoft')}>Community</li>
              <li>
                <FooterNavLink href='/veranstaltungen'>
                  <a {...navLinkStyle}>{t('footer/events')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/community'>
                  <a {...navLinkStyle}>{t('nav/community')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/format/genossenschaftsrat'>
                  <a {...navLinkStyle}>{t('nav/genossenschaftsrat')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/komplizin'>
                  <a {...navLinkStyle}>Komplizen</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/etikette'>
                  <a {...navLinkStyle}>{t('footer/me/etiquette')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/feedback'>
                  <a {...navLinkStyle}>Feedback</a>
                </FooterNavLink>
              </li>
            </ul>
            <ul {...styles.navList}>
              <li {...colorScheme.set('color', 'textSoft')}>Rechtliches</li>
              <li>
                <FooterNavLink href='/agb'>
                  <a {...navLinkStyle}>{t('footer/legal/tos')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/datenschutz'>
                  <a {...navLinkStyle}>{t('footer/legal/privacy')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/statuten'>
                  <a {...navLinkStyle}>{t('footer/legal/statute')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/aktionariat'>
                  <a {...navLinkStyle}>{t('footer/shareholder')}</a>
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href='/impressum'>
                  <a {...navLinkStyle}>{t('footer/legal/imprint')}</a>
                </FooterNavLink>
              </li>
            </ul>
          </div>
          <div {...styles.addressColumn}>
            <Address t={t} />
          </div>
        </div>
        <div {...styles.meta}>
          <div>
            <LightSwitch />
          </div>
          <div {...styles.devInfo}>
            <span
              style={{ ...fontStyles.sansSerifRegular14 }}
              {...colorScheme.set('color', 'text')}
            >
              <IconOpensource
                style={{
                  margin: '0 6px 5px 0',
                  verticalAlign: 'middle',
                  display: 'inline',
                }}
                size={20}
                {...colorScheme.set('fill', 'text')}
              />
              <a
                {...navLinkStyle}
                style={{ ...fontStyles.sansSerifRegular14 }}
                href='https://github.com/republik/plattform'
                rel='noreferrer'
                target='_blank'
              >
                {t('footer/opensource')}
              </a>
            </span>
            {inNativeApp && (
              <span
                {...navLinkStyle}
                style={{ ...fontStyles.sansSerifRegular14 }}
              >
                v{inNativeAppVersion}
                {inNativeAppBuildId && ` / ${inNativeAppBuildId}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const FooterWithStaticColorContext = (props) => {
  return (
    <ColorContextProvider colorSchemeKey='dark'>
      <Footer {...props} />
    </ColorContextProvider>
  )
}

export default compose(withT, withMe, withSignOut)(FooterWithStaticColorContext)
