import ProfileUrlIcon from '../Common/ProfileUrlIcon'
import { IconButton } from '@project-r/styleguide'

const ProfileUrlLabel = (url: string) => {
  try {
    if (/bsky\.app/.test(url)) {
      try {
        return url?.match(/\/profile\/([^/\s]+)/)[1] ?? 'Bluesky'
      } catch (e) {
        return 'Bluesky'
      }
    } else if (/facebook\.com/.test(url)) {
      return 'Facebook'
    } else if (/x\.com/.test(url)) {
      try {
        return url?.match(/x\.com\/([^/\s]+)/)[1] ?? 'X'
      } catch (e) {
        return 'X'
      }
    } else if (/threema\.id/.test(url)) {
      try {
        return url?.match(/\/threema\.id\/([^/\s]+)/)[1] ?? 'Threema'
      } catch (e) {
        return 'Threema'
      }
    } else if (/signal\.me/.test(url)) {
      return 'Signal'
    } else if (/linkedin\.com/.test(url)) {
      return 'LinkedIn'
    } else if (/\/@.+@/.test(url) || /mastodon/.test(url)) {
      try {
        return url?.match(/@[A-Za-z0-9]+/)[0] ?? 'Mastodon'
      } catch (e) {
        return 'Mastodon'
      }
    } else {
      const urlObject = new URL(url)
      return urlObject.host ?? url
    }
  } catch (e) {
    return url
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
