import React, { useRef } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'

import {
  mediaQueries,
  Center,
  Button,
  useColorContext,
  Label,
} from '@project-r/styleguide'
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../../constants'

import withT from '../../../lib/withT'
import withInNativeApp from '../../../lib/withInNativeApp'
import SignIn from '../../Auth/SignIn'
import { withMembership } from '../../Auth/checkRoles'
import Footer from '../../Footer'
import SearchForm from '../../Search/Form'
import NavLink from './NavLink'
import Sections from './Sections'
import Link from 'next/link'

const Nav = ({
  me,
  router,
  expanded,
  closeHandler,
  t,
  inNativeApp,
  inIOS,
  inNativeIOSApp,
  isMember,
  hasAccess,
  onSearchSubmit,
}) => {
  const [colorScheme] = useColorContext()
  const active = router.asPath
  const hasExpandedRef = useRef(expanded)
  if (expanded) {
    hasExpandedRef.current = true
  }
  return (
    <>
      <Center {...styles.container} id='nav'>
        {hasExpandedRef.current && (
          <>
            {!me && (
              <>
                <div {...styles.signInBlock}>
                  <SignIn style={{ padding: 0 }} />
                </div>
              </>
            )}
            {!me?.activeMembership && !inNativeIOSApp && (
              <Link href='/angebote' passHref>
                <Button style={{ marginTop: 24 }} block>
                  {t('nav/becomemember')}
                </Button>
              </Link>
            )}
            {hasAccess && (
              <SearchForm
                emptyState={
                  <Label>
                    <NavLink
                      href='/suche'
                      active={active}
                      color='disabled'
                      closeHandler={closeHandler}
                    >
                      {t('nav/searchLink')}
                    </NavLink>
                  </Label>
                }
                onSearchSubmit={onSearchSubmit}
              />
            )}
            <div {...styles.navSection}>
              <div {...styles.navLinks}>
                {isMember && (
                  <>
                    <NavLink
                      large
                      href='/'
                      active={active}
                      closeHandler={closeHandler}
                    >
                      {t('navbar/front')}
                    </NavLink>
                    <NavLink
                      prefetch
                      large
                      href='/feed'
                      active={active}
                      closeHandler={closeHandler}
                    >
                      {t('navbar/feed')}
                    </NavLink>
                  </>
                )}
                <NavLink
                  large
                  href='/dialog'
                  active={active}
                  closeHandler={closeHandler}
                >
                  {t('navbar/discussion')}
                </NavLink>
              </div>
            </div>
            {me && (
              <>
                <hr
                  {...styles.hr}
                  {...colorScheme.set('color', 'divider')}
                  {...colorScheme.set('backgroundColor', 'divider')}
                />
                <div {...styles.navSection}>
                  <Sections
                    active={active}
                    vertical
                    closeHandler={closeHandler}
                  />
                  <NavLink
                    href='/rubriken'
                    active={active}
                    closeHandler={closeHandler}
                  >
                    {t('navbar/sections')}
                  </NavLink>
                </div>
                <hr
                  {...styles.hr}
                  {...colorScheme.set('color', 'divider')}
                  {...colorScheme.set('backgroundColor', 'divider')}
                />
              </>
            )}
            <div {...styles.navSection}>
              <div
                {...styles.navLinks}
                style={{
                  // ensures last item is visible in iOS safari
                  marginBottom: inIOS && !inNativeApp ? 64 : 24,
                }}
              >
                <NavLink
                  inline
                  large
                  href='/cockpit'
                  active={active}
                  closeHandler={closeHandler}
                >
                  {t('nav/cockpit')}
                </NavLink>
                <NavLink
                  large
                  href='/veranstaltungen'
                  active={active}
                  closeHandler={closeHandler}
                >
                  {t('nav/events')}
                </NavLink>
                <NavLink
                  large
                  href='/impressum'
                  active={active}
                  closeHandler={closeHandler}
                >
                  {t('nav/team')}
                </NavLink>
              </div>
            </div>
          </>
        )}
      </Center>
      {inNativeApp && hasExpandedRef.current && <Footer />}
    </>
  )
}

const styles = {
  container: css({
    [mediaQueries.mUp]: {
      marginTop: '40px',
      marginBottom: '40px',
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
    top: HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      top: HEADER_HEIGHT,
    },
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
}

export default compose(withT, withInNativeApp, withMembership)(Nav)
