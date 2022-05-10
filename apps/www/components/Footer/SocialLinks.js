import { css } from 'glamor'

import { FacebookIcon, TwitterIcon, InstagramIcon } from '@project-r/styleguide'
import { IconButton } from '@project-r/styleguide'

const styles = {
  icons: css({
    display: 'flex',
  }),
}

const SocialLinks = () => (
  <div {...styles.icons}>
    <IconButton
      Icon={InstagramIcon}
      href='https://www.instagram.com/republikmagazin/'
      target='_blank'
    />
    <IconButton
      Icon={FacebookIcon}
      href='https://www.facebook.com/RepublikMagazin'
      target='_blank'
    />
    <IconButton
      Icon={TwitterIcon}
      href='https://twitter.com/RepublikMagazin'
      target='_blank'
    />
  </div>
)

export default SocialLinks
