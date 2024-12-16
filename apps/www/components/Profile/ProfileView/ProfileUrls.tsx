import ProfileUrlIcon from '../Common/ProfileUrlIcon'
import { IconButton } from '@project-r/styleguide'

const ProfileUrlLabel = (url: string) => {
  if (/bsky/.test(url)) {
    const bskyUsername = url.match(/\/profile\/([^/\s]+)/)[1]
    return bskyUsername || 'Bluesky'
  } else if (/facebook\.com/.test(url)) {
    return 'Facebook'
  } else if (/x\.com/.test(url)) {
    const xId = url.match(/x\.com\/([^/\s]+)/)[1]
    return xId || 'X'
  } else if (/threema\.id/.test(url)) {
    const threemaID = url.match(/\/threema\.id\/([^/\s]+)/)[1]
    return threemaID || 'Threema'
  } else if (/signal\.me/.test(url)) {
    return 'Signal'
  } else if (/\/@.+@/.test(url) || /mastodon/.test(url)) {
    return 'Mastodon'
  } else {
    const urlObject = new URL(url)
    return urlObject.host
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
