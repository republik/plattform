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
  IconLogoTelegram,
} from '@republik/icons'

import { parseProfileUrl } from './profileUrlPlatform'

const PLATFORM_ICONS = {
  bluesky: IconLogoBluesky,
  facebook: IconLogoFacebook,
  x: IconLogoX,
  threema: IconLogoThreema,
  signal: IconLogoSignal,
  linkedin: IconLogoLinkedIn,
  telegram: IconLogoTelegram,
  youtube: IconLogoYouTube,
  mastodon: IconLogoMastodon,
}

const ProfileLinkIcon = ({ url }) => {
  const platform = parseProfileUrl(url)?.platform
  const Icon = PLATFORM_ICONS[platform] ?? IconLink
  return <Icon size={24} />
}

export default ProfileLinkIcon
