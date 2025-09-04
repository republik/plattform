import { useMemo } from 'react'
import { css } from 'glamor'
import {
  fontStyles,
  mediaQueries,
  Center,
  Button,
  useColorContext,
} from '@project-r/styleguide'
import { HEADER_HEIGHT } from '../../constants'

import { useTranslation } from '../../../lib/withT'
import { useInNativeApp } from '../../../lib/withInNativeApp'
import SignIn from '../../Auth/SignIn'
import SignOut from '../../Auth/SignOut'
import Footer from '../../Footer'
import NavLink, { NavA } from './NavLink'
import NotificationFeedMini from '../../Notifications/NotificationFeedMini'
import BookmarkMiniFeed from '../../Bookmarks/BookmarkMiniFeed'
import { registerQueryVariables } from '../../Bookmarks/queries'
import DarkmodeSwitch from '../DarkmodeSwitch'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMe } from '../../../lib/context/MeContext'

const SignoutLink = ({ children, ...props }) => (
  <div {...styles.signout}>
    <NavA {...props}>{children}</NavA>
  </div>
)

const UserNav = () => {
  const { me, progressConsent, hasActiveMembership } = useMe()
  const { t } = useTranslation()
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  const router = useRouter()

  const [colorScheme] = useColorContext()
  const currentPath = router.asPath
  const variables = useMemo(() => {
    if (progressConsent) {
      return {
        collections: ['progress', 'bookmarks'],
        progress: 'UNFINISHED',
        lastDays: 30,
      }
    }
    return {
      collections: ['bookmarks'],
    }
  }, [progressConsent])
  registerQueryVariables(variables)

  return (
    <>
      <Center {...styles.container} {...colorScheme.set('color', 'text')}>
        <div>
          <>
            <div style={{ marginBottom: 20 }}>
              <DarkmodeSwitch t={t} />
            </div>
            {!me && (
              <>
                <div {...styles.signInBlock}>
                  <SignIn style={{ padding: 0 }} />
                </div>
              </>
            )}
            {!hasActiveMembership && !inNativeIOSApp && (
              <Link href='/angebote' passHref legacyBehavior>
                <Button style={{ marginTop: 24, marginBottom: 24 }} block>
                  {t('nav/becomemember')}
                </Button>
              </Link>
            )}
            {me && (
              <>
                <NavLink href='/benachrichtigungen' large>
                  {t('pages/notifications/title')}
                </NavLink>
                <NotificationFeedMini />
                <div style={{ marginTop: 24 }}>
                  <NavLink href='/lesezeichen' large>
                    {`${t('nav/bookmarks')}`}
                  </NavLink>
                </div>
                <BookmarkMiniFeed
                  style={{
                    marginTop: 10,
                  }}
                  variables={variables}
                />
                <div {...styles.navSection}>
                  <div {...styles.navLinks}>
                    <NavLink href='/konto' currentPath={currentPath} large>
                      {t('Frame/Popover/myaccount')}
                    </NavLink>
                    <NavLink
                      href={`/~${me.username || me.id}`}
                      currentPath={currentPath}
                      large
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
                    {!inNativeIOSApp && (
                      <>
                        {me?.activeMembership?.canProlong && (
                          <NavLink
                            href={{
                              pathname: '/angebote',
                              query: { package: 'PROLONG' },
                            }}
                            currentPath={currentPath}
                            large
                          >
                            {t('memberships/YEARLY_ABO/manage/prolong/link')}
                          </NavLink>
                        )}
                        <NavLink
                          href={{
                            pathname: '/angebote',
                            query: { group: 'GIVE' },
                          }}
                          currentPath={currentPath}
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
        </div>
      </Center>
      {inNativeApp && <Footer />}
    </>
  )
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
    top: HEADER_HEIGHT - 1,
  }),
  signInBlock: css({
    display: 'block',
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

export default UserNav
