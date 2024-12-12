import ProfileLinkIcon from '../ProfileLinkIcon'
import { IconButton } from '@project-r/styleguide'

const ProfileLinkLabel = (url: string) => {
  if (/bsky/.test(url)) {
    const bskyUsername = url.match(/\/profile\/([^/\s]+)/)[1]
    return bskyUsername || 'Bluesky'
  } else if (/facebook/.test(url)) {
    return 'Facebook'
  } else if (/x\.com/.test(url)) {
    return 'X'
  } else if (/threema\.id/.test(url)) {
    return 'Threema'
  } else if (/signal\.me/.test(url)) {
    return 'Signal'
  } else if (/\/@.+@/.test(url) || /mastodon/.test(url)) {
    return 'Mastodon'
  } else {
    const urlObject = new URL(url)
    return urlObject.origin
  }
}

export default function ProfileLinks({ user }) {
  const links: string[] = [
    'https://bsky.app/profile/iovi.io',
    'https://www.iovi.io',
    'https://mastodon.social/@iovi@mastodon.social',
  ]
  return (
    <>
      <IconButton
        Icon={() => <ProfileLinkIcon url={links[0]} />}
        label={ProfileLinkLabel(links[0])}
        labelShort={ProfileLinkLabel(links[0])}
        href={links[0]}
      />
      <IconButton
        Icon={() => <ProfileLinkIcon url={links[1]} />}
        label={ProfileLinkLabel(links[1])}
        labelShort={ProfileLinkLabel(links[1])}
        href={links[1]}
      />
      <IconButton
        Icon={() => <ProfileLinkIcon url={links[2]} />}
        label={ProfileLinkLabel(links[2])}
        labelShort={ProfileLinkLabel(links[2])}
        href={links[2]}
      />
    </>
  )
}
