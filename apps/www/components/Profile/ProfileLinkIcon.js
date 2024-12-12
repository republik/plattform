
import {
  IconLogoFacebook,
  IconLogoTwitter,
  IconLogoMastodon,
  IconLogoThreema,
  IconLogoSignal,
  IconLogoWhatsApp,
  IconLogoYouTube,
  IconLink,
  IconLogoBluesky,
} from '@republik/icons'

const ProfileLinkIcon = ({ url }) => {
  if (/bsky/.test(url)) {
    return <IconLogoBluesky size={24} />
  } else if (/facebook/.test(url)) {
    return <IconLogoFacebook size={24} />
  } else if (/x\.com/.test(url)) {
    return <IconLogoTwitter size={24} />
  } else if (/threema\.id/.test(url)) {
    return <IconLogoThreema size={24} />
  } else if (/signal\.me/.test(url)) {
    return <IconLogoSignal size={24} />
  } else if (/\/@.+@/.test(url) || /mastodon/.test(url)) {
    return <IconLogoMastodon size={24} />
  }
  return <IconLink size={24} />
}

export default ProfileLinkIcon