import { css } from 'glamor'

import { IconButton } from '@project-r/styleguide'
import {
  IconInstagram,
  IconLogoFacebook,
  IconLogoMastodon,
  IconLogoBluesky,
} from '@republik/icons'

const styles = {
  icons: css({
    display: 'flex',
  }),
}

const SocialLinks = () => (
  <div {...styles.icons}>
    <IconButton
      Icon={IconInstagram}
      href='https://www.instagram.com/republikmagazin/'
      target='_blank'
    />
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
    <IconButton
      Icon={IconLogoMastodon}
      href='https://republik.social/@republik_magazin'
      target='_blank'
    />
  </div>
)

export default SocialLinks
