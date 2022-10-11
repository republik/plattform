import LockIcon from 'react-icons/lib/md/lock'
import PublicIcon from 'react-icons/lib/md/public'

import { IconButton, ReadingTimeIcon } from '@project-r/styleguide'

const File = ({ file }) => {
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

export default File
