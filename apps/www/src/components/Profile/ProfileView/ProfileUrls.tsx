import ProfileUrlIcon from '../Common/ProfileUrlIcon'
import { parseProfileUrl } from '../Common/profileUrlPlatform'
import { IconButton } from '@project-r/styleguide'

const ProfileUrlLabel = (url: string) => {
  const parsed = parseProfileUrl(url)
  if (!parsed) {
    return url
  }
  const { platform, url: urlObject } = parsed
  const pathSegments = urlObject.pathname.split('/').filter(Boolean)

  switch (platform) {
    case 'bluesky': {
      const handle =
        pathSegments[0] === 'profile' ? pathSegments[1] : undefined
      return handle || 'Bluesky'
    }
    case 'facebook':
      return 'Facebook'
    case 'x':
      return pathSegments[0] || 'X'
    case 'threema':
      return pathSegments[0] || 'Threema'
    case 'signal':
      return 'Signal'
    case 'linkedin':
      return 'LinkedIn'
    case 'mastodon':
      return urlObject.pathname.match(/@[A-Za-z0-9_]+/)?.[0] ?? 'Mastodon'
    default:
      return urlObject.host || url
  }
}

export default function ProfileUrls({ user }) {
  if (!user.profileUrls) {
    return
  }
  return (
    <>
      {user.profileUrls.map((url) => {
        return (
          <IconButton
            key={url}
            Icon={() => <ProfileUrlIcon url={url} />}
            label={ProfileUrlLabel(url)}
            labelShort={ProfileUrlLabel(url)}
            href={url}
          />
        )
      })}
    </>
  )
}
