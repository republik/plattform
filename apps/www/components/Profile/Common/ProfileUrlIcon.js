
import {
  IconLogoFacebook,
  IconLogoX,
  IconLogoMastodon,
  IconLogoThreema,
  IconLogoSignal,
  IconLogoLinkedIn,
  IconLogoYouTube,
  IconLink,
  IconLogoBluesky,
  IconLogoTelegram
} from '@republik/icons'

const ProfileLinkIcon = ({ url }) => {
  if (/bsky\.com/.test(url)) {
    return <IconLogoBluesky size={24} />
  } else if (/facebook\.com/.test(url)) {
    return <IconLogoFacebook size={24} />
  } else if (/x\.com/.test(url) || /twitter\.com/.test(url)) {
    return <IconLogoX size={24} />
  } else if (/threema\.id/.test(url)) {
    return <IconLogoThreema size={24} />
  } else if (/signal\.me/.test(url)) {
    return <IconLogoSignal size={24} />
  } else if (/linkedin\.com/.test(url)) {
    return <IconLogoLinkedIn size={24} />
  } else if (/t\.me/.test(url)) {
    return <IconLogoTelegram size={24} />
  } else if (/youtube\.com/.test(url) || /youtu\.be/.test(url)  ) {
    return <IconLogoYouTube size={24} />
  } else if (/\/@.+@/.test(url) || /mastodon/.test(url)) {
    return <IconLogoMastodon size={24} />
  }
  return <IconLink size={24} />
}

export default ProfileLinkIcon