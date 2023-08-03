import { useRef, useEffect, useState, useMemo, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import {
  fontStyles,
  mediaQueries,
  Center,
  Button,
  Loader,
  useColorContext,
} from '@project-r/styleguide'
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../../constants'

import withT from '../../../lib/withT'
import withInNativeApp from '../../../lib/withInNativeApp'
import SignIn from '../../Auth/SignIn'
import SignOut from '../../Auth/SignOut'
import { withMembership, withTester } from '../../Auth/checkRoles'
import Footer from '../../Footer'
import NavLink, { NavA } from './NavLink'
import NotificationFeedMini from '../../Notifications/NotificationFeedMini'
import BookmarkMiniFeed from '../../Bookmarks/BookmarkMiniFeed'
import { registerQueryVariables } from '../../Bookmarks/queries'
import DarkmodeSwitch from '../DarkmodeSwitch'
import Link from 'next/link'

const SignoutLink = ({ children, ...props }) => (
  <div {...styles.signout}>
    <NavA {...props}>{children}</NavA>
  </div>
)

const UserNav = ({
  me,
  router,
  expanded,
  closeHandler,
  t,
  inNativeApp,
  inNativeIOSApp,
  pageColorSchemeKey,
}) => {
  const [containerPadding, setContainerPadding] = useState()
  const containerRef = useRef(null)
  useEffect(() => {
    const measureLeftPadding = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const windowWidth = window.innerWidth
        setContainerPadding((windowWidth - containerWidth) / 2)
      }
    }
    window.addEventListener('resize', measureLeftPadding)
    measureLeftPadding()
    return () => {
      window.removeEventListener('resize', measureLeftPadding)
    }
  }, [])

  const [colorScheme] = useColorContext()
  const currentPath = router.asPath
  const hasExpandedRef = useRef(expanded)
  const hasProgress = !!me?.progressConsent
  const variables = useMemo(() => {
    if (hasProgress) {
      return {
        collections: ['progress', 'bookmarks'],
        progress: 'UNFINISHED',
        lastDays: 30,
      }
    }
    return {
      collections: ['bookmarks'],
    }
  }, [hasProgress])
  registerQueryVariables(variables)

  if (expanded) {
    hasExpandedRef.current = true
  }
  return <>
    <Center
      {...styles.container}
      {...colorScheme.set('color', 'text')}
      id='nav'
    >
      <div ref={containerRef}>
        {hasExpandedRef.current && (
          <>
            <div style={{ marginBottom: 20 }}>
              <DarkmodeSwitch
                t={t}
                inNativeApp={inNativeApp}
                pageColorSchemeKey={pageColorSchemeKey}
              />
            </div>
            {!me && (
              <>
                <div {...styles.signInBlock}>
                  <SignIn style={{ padding: 0 }} />
                </div>
              </>
            )}
            {!me?.activeMembership && !inNativeIOSApp && (
              <Link href='/angebote' passHref legacyBehavior>
                <Button style={{ marginTop: 24, marginBottom: 24 }} block>
                  {t('nav/becomemember')}
                </Button>
              </Link>
            )}
            {me && (
              <>
                <NavLink
                  href='/benachrichtigungen'
                  closeHandler={closeHandler}
                  large
                >
                  {t('pages/notifications/title')}
                </NavLink>
                {expanded ? (
                  <NotificationFeedMini closeHandler={closeHandler} />
                ) : (
                  <Loader loading />
                )}
                <div style={{ marginTop: 24 }}>
                  <NavLink
                    href='/lesezeichen'
                    closeHandler={closeHandler}
                    large
                  >
                    {`${t('nav/bookmarks')}`}
                  </NavLink>
                </div>
                <div {...styles.bookmarkContainer}>
                  {expanded ? (
                    <BookmarkMiniFeed
                      style={{
                        marginTop: 10,
                        paddingLeft: containerPadding - 16,
                      }}
                      closeHandler={closeHandler}
                      variables={variables}
                    />
                  ) : (
                    <Loader loading />
                  )}
                </div>
                <div {...styles.navSection}>
                  <div {...styles.navLinks}>
                    <NavLink
                      href='/konto'
                      currentPath={currentPath}
                      large
                      closeHandler={closeHandler}
                    >
                      {t('Frame/Popover/myaccount')}
                    </NavLink>
                    <NavLink
                      href={`/~${me.username || me.id}`}
                      currentPath={currentPath}
                      large
                      closeHandler={closeHandler}
                    >
                      {t('Frame/Popover/myprofile')}
                    </NavLink>
                  </div>
                </div>
                <hr
                  {...styles.hr}
                  {...colorScheme.set('color', 'divider')}
                  {...colorScheme.set('backgroundColor', 'divider')}
                />
                <div {...styles.navSection}>
                  <div {...styles.navLinks}>
                    {me?.accessCampaigns?.length > 0 && (
                      <NavLink
                        href='/teilen'
                        currentPath={currentPath}
                        closeHandler={closeHandler}
                        large
                      >
                        {t('nav/share')}
                      </NavLink>
                    )}
                    {!inNativeIOSApp && (
                      <>
                        <NavLink
                          href={{
                            pathname: '/angebote',
                            query: { group: 'GIVE' },
                          }}
                          currentPath={currentPath}
                          closeHandler={closeHandler}
                          large
                        >
                          {t('nav/give')}
                        </NavLink>
                        <NavLink
                          {...fontStyles.sansSerifLight16}
                          href={{
                            pathname: '/angebote',
                            query: { package: 'DONATE' },
                          }}
                          currentPath={currentPath}
                          closeHandler={closeHandler}
                          large
                        >
                          {t('nav/donate')}
                        </NavLink>
                      </>
                    )}
                  </div>
                </div>
                <div {...styles.navSection}>
                  <div {...styles.navLinks} {...styles.smallLinks}>
                    <SignOut Link={SignoutLink} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Center>
    {inNativeApp && hasExpandedRef.current && <Footer />}
  </>;
}

const styles = {
  container: css({
    [mediaQueries.mUp]: {
      marginTop: '40px',
    },
  }),
  hr: css({
    margin: 0,
    display: 'block',
    border: 0,
    height: 1,
    width: '100%',
  }),
  hrFixed: css({
    position: 'fixed',
    top: HEADER_HEIGHT_MOBILE - 1,
    [mediaQueries.mUp]: {
      top: HEADER_HEIGHT - 1,
    },
  }),
  signInBlock: css({
    display: 'block',
  }),
  bookmarkContainer: css({
    width: '100vw',
    position: 'relative',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
  }),
  navSection: css({
    display: 'flex',
    flexDirection: 'column',
    margin: '24px 0px',
  }),
  navLinks: css({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  smallLinks: css({
    '& a': {
      ...fontStyles.sansSerifRegular18,
    },
  }),
}

export default compose(withT, withInNativeApp, withMembership)(UserNav)
