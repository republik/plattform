import { useState } from 'react'
import { css } from 'glamor'

import {
  IconLock,
  IconPublic,
  IconError,
  IconReadTime,
  IconLink,
} from '@republik/icons'

import {
  A,
  Button,
  Label,
  IconButton,
} from '@project-r/styleguide'

import { swissTime } from '../../lib/utils/format'

import Destroy from './actions/Destroy'
import Publish from './actions/Publish'
import Unpublish from './actions/Unpublish'
import type { FileUsageMap } from './utils/extractUrlsFromContent'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const styles = {
  list: css({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  }),
  row: css({
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    padding: '12px 0',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    gap: '24px',
    '@media (max-width: 600px)': {
      flexWrap: 'wrap',
    },
  }),
  cellIcon: css({
    flexShrink: 0,
    flexGrow: 0,
  }),
  cellContent: css({
    flex: '1 1 0%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  }),
  cellActions: css({
    flexShrink: 0,
    flexGrow: 0,
    '@media (max-width: 600px)': {
      width: '100%',
      marginTop: '8px',
    },
  }),
  fileName: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  }),
  usageInfo: css({
    paddingLeft: '24px',
    margin: '4px 0',
  }),
  actions: css({
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    '@media (max-width: 600px)': {
      justifyContent: 'flex-start',
    },
  }),
}

type FileStatus = 'Pending' | 'Failure' | 'Private' | 'Public'

interface RepoFile {
  id: string
  name: string
  url: string
  status: FileStatus
  createdAt: string
  error?: string
  author?: {
    name: string
  }
}

interface UrlInfo {
  url: string
  type: string
  text: string
}

interface StatusConfig {
  Icon: React.ComponentType<{ size?: number | string }>
  disabled: boolean
  colorName: string | undefined
  crumb: string | undefined
  Action: React.ComponentType<{
    file: RepoFile
    isInUse: boolean
    usages: UrlInfo[] | undefined
  }> | undefined
}

const statusMap: Record<FileStatus, StatusConfig> = {
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
    crumb: 'öffentlich',
    Action: Unpublish,
  },
}

interface UsageInfoProps {
  usages: UrlInfo[] | undefined
}

const UsageInfo: React.FC<UsageInfoProps> = ({ usages }) => {
  if (!usages || usages.length === 0) return null

  return (
    <ul {...styles.usageInfo}>
      {usages.map((usage) => (
        <li key={usage.url}>
          <IconLink size={14} style={{ flexShrink: 0 }} />
          <Label>Verwendet im Dokument ({usage.text})</Label>
        </li>
      ))}
    </ul>
  )
}

interface FileRowProps {
  file: RepoFile
  usages: UrlInfo[] | undefined
}

const FileRow: React.FC<FileRowProps> = ({ file, usages }) => {
  const { Icon, disabled, crumb, Action } =
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
    <div {...styles.row}>
      <div {...styles.cellIcon}>
        <IconButton Icon={Icon} label={crumb} onClick={onClick} />
      </div>
      <div {...styles.cellContent}>
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
        <UsageInfo usages={usages} />
      </div>
      <div {...styles.cellActions}>
        <div {...styles.actions}>
          <Button onClick={onClick} small style={{ whiteSpace: 'nowrap' }}>
            {copied ? 'Kopiert!' : 'Link kopieren'}
          </Button>
          {Action && <Action file={file} isInUse={isInUse} usages={usages} />}
        </div>
      </div>
    </div>
  )
}

interface FilesTableProps {
  files: RepoFile[]
  fileUsageMap: FileUsageMap
}

const FilesTable: React.FC<FilesTableProps> = ({ files, fileUsageMap }) => {
  return (
    <div {...styles.list}>
      {files.map((file) => (
        <FileRow
          key={file.id}
          file={file}
          usages={fileUsageMap.get(file.url)}
        />
      ))}
    </div>
  )
}

export default FilesTable
export type { RepoFile, UrlInfo }
