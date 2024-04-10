import { css } from 'glamor'

import { IconLock, IconPublic, IconError, IconReadTime } from '@republik/icons'

import { IconButton, Label } from '@project-r/styleguide'

import { swissTime } from '../../lib/utils/format'

import { Tr, Td } from '../Table'

import Destroy from './actions/Destroy'
import Publish from './actions/Publish'
import Unpublish from './actions/Unpublish'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const styles = {
  label: css({
    marginLeft: '2rem',
  }),
}

const statusMap = {
  Pending: {
    Icon: IconReadTime,
    disabled: true,
    colorName: undefined,
    crumb: undefined,
    Action: undefined,
  },
  Failure: {
    Icon: IconError,
    disabled: false,
    colorName: 'error',
    crumb: undefined,
    Action: Destroy,
  },
  Private: {
    Icon: IconLock,
    disabled: false,
    colorName: undefined,
    crumb: 'nicht öffentlich',
    Action: Publish,
  },
  Public: {
    Icon: IconPublic,
    disabled: false,
    colorName: 'primary',
    crumb: undefined,
    Action: Unpublish,
  },
}

const File = ({ file }) => {
  const { Icon, disabled, colorName, crumb, Action } =
    statusMap[file.status] || statusMap.Pending

  return (
    <Tr>
      <Td>
        <IconButton
          Icon={Icon}
          href={!disabled ? file.url : undefined}
          target='_blank'
          label={file.name}
          labelShort={file.name}
          disabled={disabled}
          fillColorName={colorName}
        />
        <div {...styles.label}>
          <Label>
            {[
              timeFormat(new Date(file.createdAt)),
              file.author?.name,
              file.error,
              crumb,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Label>
        </div>
      </Td>
      <Td style={{ textAlign: 'right' }}>{Action && <Action file={file} />}</Td>
    </Tr>
  )
}

export default File
