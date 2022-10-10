import LockIcon from 'react-icons/lib/md/lock'
import PublicIcon from 'react-icons/lib/md/public'

import { IconButton } from '@project-r/styleguide'
import { ReadingTimeIcon } from '@project-r/styleguide/dist/components/Icons'

export default ({ file }) => {
  const isPublic = file.status === 'PUBLIC'
  const isReady = ['PUBLIC', 'PRIVATE'].includes(file.status)

  const Icon =
    (file.status === 'PUBLIC' && PublicIcon) ||
    (file.status === 'PRIVATE' && LockIcon) ||
    ReadingTimeIcon

  const href = isReady ? file.url : undefined

  return (
    <IconButton
      Icon={Icon}
      href={href}
      target='_blank'
      label={file.name}
      labelShort={file.name}
      disabled={!isReady}
      fillColorName={isPublic && 'primary'}
    />
  )
}
