import { css } from 'glamor'
import 'glamor/reset'
import {
  mediaQueries,
  fontFamilies,
  Label,
  IconButton,
} from '@project-r/styleguide'
import { EMAIL_CONTACT } from '../../lib/constants'
import { IconLogoFacebook, IconLogoBluesky } from '@republik/icons'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

export const SPACE = 60

const linkRule = css({
  textDecoration: 'none',
  color: 'inherit',
  '@media (hover)': {
    ':hover': {
      opacity: 0.6,
    },
  },
})

export const A = ({ children, ...props }) => (
  <a {...props} {...linkRule}>
    {children}
  </a>
)

const styles = {
  container: css({
    marginTop: SPACE * 2,
    paddingBottom: SPACE,
    textAlign: 'center',
  }),
  nav: css({
    marginTop: SPACE,
    marginBottom: SPACE,
    [mediaQueries.mUp]: {
      marginTop: SPACE,
      marginBottom: SPACE * 2,
    },
  }),
  mainNav: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 44,
    lineHeight: '60px',
  }),
  address: css({
    lineHeight: 1.6,
    fontStyle: 'normal',
  }),
  icons: css({
    display: 'flex',
    justifyContent: 'center',
  }),
}

const Footer = ({ en }) => (
  <div {...styles.container}>
    <div {...styles.nav}>
      {!!en && <Label>Read more in German</Label>}
      <div {...styles.mainNav}>
        <br />
        <A
          href='https://project-r.construction/'
          target='_blank'
          rel='noreferrer'
        >
          Project R
        </A>
      </div>
    </div>

    <address {...styles.address} style={{ marginBottom: 20 }}>
      <A
        href='https://goo.gl/maps/j1F8cXQhrmo'
        target='_blank'
        rel='noreferrer'
      >
        Republik AG
        <br />
        Sihlhallenstrasse 1<br />
        8004 Zürich
        <br />
        {!!en && (
          <span>
            Switzerland
            <br />
          </span>
        )}
      </A>
      <A href={`mailto:${EMAIL_CONTACT}`}>{EMAIL_CONTACT}</A>
    </address>

    <div {...styles.icons}>
      <IconButton
        Icon={IconLogoFacebook}
        href='https://www.facebook.com/RepublikMagazin'
        target='_blank'
      />
      <IconButton
        Icon={IconLogoBluesky}
        href='https://bsky.app/profile/republik.ch'
        target='_blank'
      />
    </div>
  </div>
)

export default Footer
