import { useMemo, useState, useRef, useEffect } from 'react'
import { css } from 'glamor'
import { useRouter } from 'next/router'
import {
  Logo,
  mediaQueries,
  HeaderHeightProvider,
  useColorContext,
} from '@project-r/styleguide'
import { useTranslation } from '../../lib/withT'
import { postMessage, useInNativeApp } from '../../lib/withInNativeApp'
import NotificationIcon from '../Notifications/NotificationIcon'
import HLine from '../Frame/HLine'

import User from './User'
import LoadingBar from './LoadingBar'
import Pullable from './Pullable'
import Toggle from './Toggle'
import SecondaryNav from './SecondaryNav'
import CallToAction from './CallToAction'

import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  SUBHEADER_HEIGHT,
  ZINDEX_POPOVER,
  LOGO_WIDTH,
  LOGO_PADDING,
  LOGO_WIDTH_MOBILE,
  LOGO_PADDING_MOBILE,
} from '../constants'
import { IconBack } from '@republik/icons'
import Link from 'next/link'

const BACK_BUTTON_SIZE = 24

let routeChangeStarted

const USER_MENU_URL = '/meine-republik'

const Header = ({
  isAnyNavExpanded,
  setIsAnyNavExpanded,
  headerOffset,
  setHeaderOffset,
  hasSecondaryNav,
  me,
  secondaryNav,
  formatColor,
  pullable = true,
  hasOverviewNav,
  stickySecondaryNav,
}) => {
  const { t } = useTranslation()
  const { inNativeIOSApp, inNativeApp } = useInNativeApp()
  const [colorScheme] = useColorContext()
  const [isMobile, setIsMobile] = useState()
  const [scrollableHeaderHeight, setScrollableHeaderHeight] =
    useState(HEADER_HEIGHT_MOBILE)
  const [expandedNav, setExpandedNav] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (router.pathname === USER_MENU_URL) {
      setExpandedNav('user')
    }
  }, [router.pathname, setExpandedNav])

  const fixedRef = useRef()
  const diff = useRef(0)
  const lastY = useRef()
  const lastDiff = useRef()

  const topLevelPaths = ['/', '/feed', '/dialog', '/suche', USER_MENU_URL]
  const isOnTopLevelPage =
    topLevelPaths.includes(router.asPath) || router.asPath.endsWith('/journal')
  const backButton = inNativeIOSApp && me && !isOnTopLevelPage

  // check if we can pop the navigation stack
  const closeHandler = () =>
    window.history.length > 1 ? router.back() : router.push('/')

  useEffect(() => {
    router.prefetch(me ? '/meine-republik' : '/anmelden')
  }, [me?.id])

  const userButtonLink = me ? '/meine-republik' : '/anmelden'

  useEffect(() => {
    const onScroll = () => {
      const y = Math.max(window.pageYOffset, 0)

      if (isAnyNavExpanded) {
        diff.current = 0
      } else {
        const newDiff = lastY.current ? lastY.current - y : 0
        diff.current += newDiff
        diff.current = Math.min(
          Math.max(-scrollableHeaderHeight, diff.current),
          0,
        )
      }

      if (diff.current !== lastDiff.current && fixedRef.current) {
        fixedRef.current.style.top = `${diff.current}px`
        setHeaderOffset(diff.current)
      }

      lastY.current = y
      lastDiff.current = diff.current
    }

    const measure = () => {
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      if (mobile !== isMobile) {
        setIsMobile(mobile)
      }
      onScroll()
    }

    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [isAnyNavExpanded, scrollableHeaderHeight, isMobile])

  const hasStickySecondary = hasSecondaryNav && stickySecondaryNav
  useEffect(() => {
    setScrollableHeaderHeight(
      (isMobile ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT) +
        (hasSecondaryNav && !hasStickySecondary ? SUBHEADER_HEIGHT : 0) +
        // scroll away thin HLine
        (formatColor || hasStickySecondary ? 0 : 1),
    )
  }, [isMobile, hasSecondaryNav, hasStickySecondary, formatColor])

  const showToggle = me || inNativeApp || router.pathname === '/angebote'
  const showClose = router.pathname === USER_MENU_URL

  return (
    <>
      <div
        {...styles.navBar}
        {...colorScheme.set('backgroundColor', 'default')}
        ref={fixedRef}
      >
        <div {...styles.primary}>
          <div {...styles.navBarItem}>
            <div {...styles.leftBarItem}>
              {backButton && (
                <a
                  {...styles.back}
                  style={{
                    opacity: 1,
                    pointerEvents: backButton ? undefined : 'none',
                    href: '#back',
                  }}
                  title={t('header/back')}
                  onClick={(e) => {
                    e.preventDefault()
                    if (backButton) {
                      routeChangeStarted = false
                      window.history.back()
                      setTimeout(() => {
                        if (!routeChangeStarted) {
                          router.replace('/')
                        }
                      }, 200)
                    }
                  }}
                >
                  <IconBack
                    size={BACK_BUTTON_SIZE}
                    {...colorScheme.set('fill', 'text')}
                  />
                </a>
              )}
              <User
                me={me}
                backButton={backButton}
                id='user'
                title={t(
                  `header/nav/user/${
                    expandedNav === 'user' ? 'close' : 'open'
                  }/aria`,
                )}
                inNativeIOSApp={inNativeIOSApp}
                onClick={() => {
                  if (router.asPath.startsWith(userButtonLink)) {
                    return closeHandler()
                  } else {
                    if (
                      userButtonLink === '/anmelden' &&
                      !router.asPath.startsWith('/anmelden')
                    ) {
                      router.push(
                        `${userButtonLink}?redirect=${encodeURIComponent(
                          router.asPath,
                        )}`,
                      )
                    } else {
                      router.push(userButtonLink)
                    }
                  }
                }}
              />
              {me && <NotificationIcon />}
            </div>
          </div>
          <div {...styles.navBarItem}>
            <Link
              {...styles.logo}
              aria-label={t('header/logo/magazine/aria')}
              href={'/'}
            >
              <Logo />
            </Link>
          </div>
          <div {...styles.navBarItem}>
            <div {...styles.rightBarItem}>
              {!showToggle && (
                <div data-show-if-me='true'>
                  <Toggle
                    expanded={showClose}
                    title={t(
                      `header/nav/${
                        expandedNav === 'main' ? 'close' : 'open'
                      }/aria`,
                    )}
                  />
                </div>
              )}
              {
                showToggle ? (
                  <Toggle
                    expanded={showClose}
                    title={t(
                      `header/nav/${
                        expandedNav === 'main' ? 'close' : 'open'
                      }/aria`,
                    )}
                    closeOverlay={closeHandler}
                  />
                ) : // TODO: decide what to do with this abonnieren CTA
                null
                // <CallToAction formatColor={formatColor} />
              }
            </div>
          </div>
        </div>
        <SecondaryNav
          secondaryNav={secondaryNav}
          router={router}
          formatColor={formatColor}
          hasOverviewNav={hasOverviewNav}
          isSecondarySticky={headerOffset === -scrollableHeaderHeight}
        />
        <HLine formatColor={formatColor} />
      </div>
      <LoadingBar
        onRouteChangeStart={() => {
          routeChangeStarted = true
        }}
      />
      {inNativeApp && pullable && (
        <Pullable
          onRefresh={() => {
            if (inNativeIOSApp) {
              postMessage({ type: 'haptic', payload: { type: 'impactLight' } })
            }
            // give the browser 3 frames (1000/30fps) to start animating the spinner
            setTimeout(() => {
              window.location.reload(true)
            }, 33 * 3)
          }}
        />
      )}
    </>
  )
}

const HeaderWithContext = (props) => {
  const [isAnyNavExpanded, setIsAnyNavExpanded] = useState(false)
  const [headerOffset, setHeaderOffset] = useState(0)

  const {
    cover,
    children,
    hasOverviewNav,
    secondaryNav,
    isOnMarketingPage,
    me,
  } = props

  const hasSecondaryNav = hasOverviewNav || secondaryNav
  const headerConfig = useMemo(() => {
    return [
      {
        minWidth: 0,
        headerHeight:
          HEADER_HEIGHT_MOBILE +
          (hasSecondaryNav ? SUBHEADER_HEIGHT : 0) +
          headerOffset,
      },
      {
        minWidth: mediaQueries.mBreakPoint,
        headerHeight:
          HEADER_HEIGHT +
          (hasSecondaryNav ? SUBHEADER_HEIGHT : 0) +
          headerOffset,
      },
    ]
  }, [hasSecondaryNav, headerOffset])

  return (
    <HeaderHeightProvider config={headerConfig}>
      {!(isOnMarketingPage && !me) && (
        <Header
          {...props}
          hasSecondaryNav={hasSecondaryNav}
          isAnyNavExpanded={isAnyNavExpanded}
          setIsAnyNavExpanded={setIsAnyNavExpanded}
          headerOffset={headerOffset}
          setHeaderOffset={setHeaderOffset}
        />
      )}
      {cover}
      {children}
    </HeaderHeightProvider>
  )
}

export default HeaderWithContext

const styles = {
  navBar: css({
    zIndex: ZINDEX_POPOVER + 1,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    '@media print': {
      display: 'none',
    },
  }),
  primary: css({
    display: 'flex',
    justifyContent: 'space-between',
  }),
  navBarItem: css({
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  }),
  leftBarItem: css({
    marginRight: 'auto',
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
  }),
  rightBarItem: css({
    marginLeft: 'auto',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    '@media print': {
      display: 'none',
    },
  }),
  back: css({
    display: 'block',
    padding: Math.floor((HEADER_HEIGHT_MOBILE - BACK_BUTTON_SIZE) / 2),
    paddingRight: 0,
    [mediaQueries.mUp]: {
      padding: Math.floor((HEADER_HEIGHT - BACK_BUTTON_SIZE) / 2),
      paddingRight: 0,
    },
  }),
  logo: css({
    display: 'block',
    padding: LOGO_PADDING_MOBILE,
    width: LOGO_WIDTH_MOBILE + LOGO_PADDING_MOBILE * 2,
    verticalAlign: 'middle',
    [mediaQueries.mUp]: {
      padding: LOGO_PADDING,
      width: LOGO_WIDTH + LOGO_PADDING * 2,
    },
  }),
  button: css({
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontSize: 16,
    verticalAlign: 'middle',
    textAlign: 'center',
    textDecoration: 'none',
    lineHeight: 1.75,
    padding: '10px 20px',
    [mediaQueries.mUp]: {
      fontSize: 22,
    },
  }),
  buttonFormatColor: css({
    height: HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      padding: '10px 30px',
      height: HEADER_HEIGHT,
    },
  }),
  buttonGeneric: css({
    height: HEADER_HEIGHT_MOBILE + 1,
    marginBottom: -1, // overlap HR line below button
    [mediaQueries.mUp]: {
      padding: '10px 30px',
      height: HEADER_HEIGHT + 1,
    },
  }),
  buttonMarketing: css({
    height: HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      height: HEADER_HEIGHT,
      padding: '10px 80px',
    },
  }),
  buttonText: css({
    display: 'none',
    [mediaQueries.mUp]: {
      display: 'inline',
    },
  }),
  buttonTextMobile: css({
    display: 'inline',
    [mediaQueries.mUp]: {
      display: 'none',
    },
  }),
}
