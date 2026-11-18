import ProfileUrlIcon from '../Common/ProfileUrlIcon'
import { parseProfileUrl } from '../Common/profileUrlPlatform'
import { IconButton } from '@project-r/styleguide'

export default function ProfileUrls({ user }) {
  if (!user.profileUrls) {
    return
  }
  return (
    <>
      {user.profileUrls.map((url: string) => {
        const label = parseProfileUrl(url)?.label ?? url
        return (
          <IconButton
            key={url}
            Icon={() => <ProfileUrlIcon url={url} />}
            label={label}
            labelShort={label}
            href={url}
          />
        )
      })}
    </>
  )
}
