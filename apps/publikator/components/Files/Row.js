import { useState } from 'react'
import { css } from 'glamor'

import {
  IconLock,
  IconPublic,
  IconError,
  IconReadTime,
  IconLink,
} from '@republik/icons'

import { A, Button, Label, useColorContext } from '@project-r/styleguide'

import { swissTime } from '../../lib/utils/format'

import { Tr, Td } from '../Table'

import Destroy from './actions/Destroy'
import Publish from './actions/Publish'
import Unpublish from './actions/Unpublish'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const styles = {
  fileRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  fileName: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '400px',
  }),
  label: css({
    marginLeft: '1.5rem',
  }),
  usageInfo: css({
    marginLeft: '1.5rem',
    marginTop: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  }),
  actions: css({
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
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

const UsageTypeLabels = {
  link: 'Link',
  image: 'Bild',
  embed: 'Embed',
  meta: 'Metadaten',
}

const UsageInfo = ({ usages }) => {
  const [colorScheme] = useColorContext()

  if (!usages || usages.length === 0) return null

  // Group usages by type and show summary
  const usageText = usages
    .map((u) => `${UsageTypeLabels[u.type] || u.type}: "${u.text}"`)
    .join(', ')

  return (
    <div {...styles.usageInfo}>
      <IconLink
        size={14}
        fill={colorScheme.getCSSColor('primary')}
        style={{ flexShrink: 0 }}
      />
      <Label style={{ color: colorScheme.getCSSColor('primary') }}>
        Verwendet im Dokument ({usageText})
      </Label>
    </div>
  )
}

const File = ({ file, usages }) => {
  const [colorScheme] = useColorContext()
  const { Icon, disabled, colorName, crumb, Action } =
    statusMap[file.status] || statusMap.Pending

  const isInUse = usages && usages.length > 0

  const [copied, setCopied] = useState(false)

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(file.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <Tr>
      <Td>
        <div {...styles.fileRow}>
          <Icon
            size={20}
            fill={colorName ? colorScheme.getCSSColor(colorName) : undefined}
            style={{ flexShrink: 0 }}
          />
          {disabled ? (
            <span {...styles.fileName} title={file.name}>
              {file.name}
            </span>
          ) : (
            <A
              href={file.url}
              target='_blank'
              {...styles.fileName}
              title={file.name}
            >
              {file.name}
            </A>
          )}
        </div>
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
        <UsageInfo usages={usages} />
      </Td>
      <Td style={{ textAlign: 'right' }}>
        <div {...styles.actions}>
          {file.status === 'Public' && (
            <Button onClick={onClick} small style={{ whiteSpace: 'nowrap' }}>
              {copied ? 'Kopiert!' : 'Link kopieren'}
            </Button>
          )}
          {Action && <Action file={file} isInUse={isInUse} usages={usages} />}
        </div>
      </Td>
    </Tr>
  )
}

export default File
