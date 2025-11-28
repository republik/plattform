import { useMemo, useState, useRef, useEffect } from 'react'
import { css } from 'glamor'
import { useRouter } from 'next/router'
import {
  Logo,
  mediaQueries,
  HeaderHeightProvider,
  useColorContext,
  isBodyScrollLocked,
  fontStyles,
  plainButtonRule,
} from '@project-r/styleguide'
import { useTranslation } from '../../lib/withT'
import { postMessage, useInNativeApp } from '../../lib/withInNativeApp'
import { useScrollDirection } from '../../src/lib/hooks/useScrollDirection'
import { useAudioContext } from '../Audio/AudioProvider'
import HLine from './HLine'

import User from './User'
import LoadingBar from './LoadingBar'
import Pullable from './Pullable'
import AudioPlayerToggle from './AudioPlayerToggle'
import SecondaryNav from './SecondaryNav'

import {
  HEADER_HEIGHT,
  SUBHEADER_HEIGHT,
  ZINDEX_POPOVER,
  LOGO_WIDTH,
  LOGO_WIDTH_MOBILE,
} from '../constants'
import { IconBack } from '@republik/icons'
import Link from 'next/link'

const BACK_BUTTON_SIZE = 24

const Header = ({
  isAnyNavExpanded,
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
  const { isExpanded: audioPlayerExpanded } = useAudioContext()
  const [colorScheme] = useColorContext()
  const router = useRouter()
  const scrollableHeaderHeight = useMemo(() => {
    return (
      HEADER_HEIGHT +
      (hasSecondaryNav && !stickySecondaryNav ? SUBHEADER_HEIGHT : 0) +
      (formatColor || !!stickySecondaryNav ? 0 : 1)
    )
  }, [hasSecondaryNav, stickySecondaryNav, formatColor])

  const scrollDirection = useScrollDirection({
    upThreshold: 25,
    downThreshold: scrollableHeaderHeight,
  })

  const fixedRef = useRef<HTMLDivElement>(null)

  const isOnTopLevelPage = ['/', '/feed', '/dialog', '/suche'].includes(
    router.asPath,
  )
  const showBackButton = inNativeIOSApp && me && !isOnTopLevelPage

  useEffect(() => {
    router.prefetch(me ? '/meine-republik' : '/anmelden')
  }, [me?.id])

  return (
    <>
      <div
        {...styles.navBar}
        {...colorScheme.set('backgroundColor', 'default')}
        ref={fixedRef}
        style={{
          transform: `translateY(${
            scrollDirection === 'down' && !isAnyNavExpanded
              ? -scrollableHeaderHeight
              : 0
          }px)`,
        }}
      >
        <div {...styles.header}>
          <div {...styles.left}>
            {showBackButton && (
              <button
                {...styles.backButton}
                style={{ opacity: 1 }}
                type='button'
                title={t('header/back')}
                onClick={() => {
                  if (window.history.length > 1) {
                    router.back()
                  } else {
                    router.replace('/')
                  }
                }}
              >
                <IconBack
                  size={BACK_BUTTON_SIZE}
                  {...colorScheme.set('fill', 'text')}
                />
              </button>
            )}
            {me ? (
              <User
                me={me}
                title={t('header/nav/user/open/aria')}
                onClick={() => {
                  router.push(me ? '/meine-republik' : '/anmelden')
                }}
              />
            ) : (
              <Link
                href='/anmelden'
                {...styles.signInLink}
                {...colorScheme.set('color', 'text')}
              >
                {t('header/signin')}
              </Link>
            )}
          </div>
          <Link
            {...styles.logoLink}
            aria-label={t('header/logo/magazine/aria')}
            href={'/'}
          >
            <Logo fill='var(--color-text)' />
          </Link>
          <div {...styles.right}>
            <AudioPlayerToggle />
          </div>
        </div>
        <SecondaryNav
          secondaryNav={secondaryNav}
          hasOverviewNav={hasOverviewNav}
          isSecondarySticky={scrollDirection === 'down' && !isAnyNavExpanded}
        />
        <HLine formatColor={formatColor} />
        <LoadingBar />
      </div>
      {inNativeApp && pullable && (
        <Pullable
          shouldPullToRefresh={() =>
            window.scrollY <= 0 && !isBodyScrollLocked() && !audioPlayerExpanded
          }
          onRefresh={() => {
            if (inNativeIOSApp) {
              postMessage({ type: 'haptic', payload: { type: 'impactLight' } })
            }
            // give the browser 3 frames (1000/30fps) to start animating the spinner
            setTimeout(() => {
              window.location.reload()
            }, 33 * 3)
          }}
        />
      )}
    </>
  )
}

const HeaderWithContext = (props) => {
  const [isAnyNavExpanded, setIsAnyNavExpanded] = useState(false)

  const { cover, children, hasOverviewNav, secondaryNav, stickySecondaryNav } =
    props
  const hasSecondaryNav = hasOverviewNav || secondaryNav

  // Use the simplified scroll direction hook
  const scrollDirection = useScrollDirection({
    upThreshold: 25,
    downThreshold: HEADER_HEIGHT + (hasSecondaryNav ? SUBHEADER_HEIGHT : 0),
  })

  return (
    <HeaderHeightProvider
      height={
        scrollDirection === 'down'
          ? stickySecondaryNav && hasSecondaryNav
            ? SUBHEADER_HEIGHT
            : 0
          : HEADER_HEIGHT + (hasSecondaryNav ? SUBHEADER_HEIGHT : 0)
      }
    >
      <Header
        {...props}
        hasSecondaryNav={hasSecondaryNav}
        isAnyNavExpanded={isAnyNavExpanded}
        setIsAnyNavExpanded={setIsAnyNavExpanded}
      />
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
    width: '100vw',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-out',
    '@media print': {
      display: 'none',
    },
  }),
  header: css({
    height: HEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '0 16px',
  }),
  logoLink: css({
    flexShrink: 0,
    width: LOGO_WIDTH_MOBILE,
    [mediaQueries.mUp]: {
      width: LOGO_WIDTH,
    },
  }),
  left: css({
    flex: 1,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  }),
  right: css({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),
  backButton: css({
    ...plainButtonRule,
    display: 'block',
  }),
  signInLink: css({
    ...fontStyles.sansSerifRegular12,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular16,
    },
  }),
}
