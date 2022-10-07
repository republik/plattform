import compose from 'lodash/flowRight'
import { css } from 'glamor'

import {
  mediaQueries,
  Center,
  Button,
  useColorContext,
} from '@project-r/styleguide'
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../../constants'

import withT from '../../../lib/withT'
import useInNativeApp from '../../../lib/withInNativeApp'
import SignIn from '../../Auth/SignIn'
import { withMembership } from '../../Auth/checkRoles'
import Footer from '../../Footer'
import NavLink from './NavLink'
import FlyerNavLink from './FlyerNavLink'
import Sections from './Sections'
import Link from 'next/link'

const Nav = ({ me, router, t, isMember }) => {
  const [colorScheme] = useColorContext()
  const active = router.asPath
  const { inNativeIOSApp, inIOS, inNativeApp } = useInNativeApp()
  return (
    <>
      <Center {...styles.container} id='nav'>
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
        {me && (
          <>
            <div {...styles.navSection}>
              <Sections active={active} vertical />
              <NavLink href='/rubriken' active={active}>
                {t('nav/sections')}
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
            <NavLink inline large href='/cockpit' active={active}>
              {t('nav/cockpit')}
            </NavLink>
            <NavLink large href='/veranstaltungen' active={active}>
              {t('nav/events')}
            </NavLink>
            <NavLink large href='/impressum' active={active}>
              {t('nav/team')}
            </NavLink>
          </div>
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

export default compose(withT, withMembership)(Nav)
