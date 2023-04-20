import React, { useEffect, useMemo, useState } from 'react'
import IconButton from '../../IconButton'
import { css } from 'glamor'
import { insertElement, moveElement, removeElement } from './helpers/structure'
import { useSlate } from 'slate-react'
import { useFormContext } from './Forms'
import { CustomElement, TemplateType } from '../custom-types'
import { config as elConfig } from '../config/elements'
import CalloutMenu from '../../Callout/CalloutMenu'
import colors from '../../../theme/colors'
import { Node } from 'slate'
import { useRenderContext } from '../Render/Context'
import {
  IconAdd,
  IconArrowDownward,
  IconArrowUpward,
  IconDeleteOutline,
  IconEdit,
  IconMoreVertical,
} from '@republik/icons'

const DEFAULT_POSITION = {
  top: 0,
  left: -40,
}

const styles = {
  container: css({
    display: 'block',
    userSelect: 'none',
    position: 'absolute',
    background: 'white',
    padding: 3,
    borderRadius: 40,
    color: colors.light.text,
  }),
  padded: css({
    display: 'block',
    marginBottom: 8,
  }),
}

const iconStyle = { paddingBottom: 8 }

const MoveUp: React.FC<{
  path: number[]
}> = ({ path }) => {
  const { t } = useRenderContext()
  const editor = useSlate()
  const isDisabled = useMemo(
    () => !moveElement(editor, path, 'up', true),
    [path],
  )
  return (
    <IconButton
      Icon={IconArrowUpward}
      onClick={(e) => {
        e.preventDefault()
        moveElement(editor, path, 'up')
      }}
      disabled={isDisabled}
      title='move element up'
      style={iconStyle}
      label={t('editor/blockUi/moveUp')}
      labelShort={t('editor/blockUi/moveUp')}
    />
  )
}

const MoveDown: React.FC<{
  path: number[]
}> = ({ path }) => {
  const { t } = useRenderContext()
  const editor = useSlate()
  const isDisabled = useMemo(
    () => !moveElement(editor, path, 'down', true),
    [path],
  )
  return (
    <IconButton
      Icon={IconArrowDownward}
      onClick={(e) => {
        e.preventDefault()
        moveElement(editor, path, 'down')
      }}
      disabled={isDisabled}
      title='move element down'
      style={iconStyle}
      label={t('editor/blockUi/moveDown')}
      labelShort={t('editor/blockUi/moveDown')}
    />
  )
}

const Remove: React.FC<{
  path: number[]
}> = ({ path }) => {
  const { t } = useRenderContext()
  const editor = useSlate()
  const isDisabled = useMemo(() => !removeElement(editor, path, true), [path])
  return (
    <IconButton
      Icon={IconDeleteOutline}
      fill={colors.error}
      onClick={(e) => {
        e.preventDefault()
        removeElement(editor, path)
      }}
      disabled={isDisabled}
      title='remove element'
      style={iconStyle}
      label={t('editor/blockUi/remove')}
      labelShort={t('editor/blockUi/remove')}
    />
  )
}

const Insert: React.FC<{
  path: number[]
  templates: TemplateType | TemplateType[]
  direction: 'before' | 'after'
}> = ({ path, templates, direction }) => {
  const { t } = useRenderContext()
  const editor = useSlate()
  const [pendingPath, setPendingPath] = useState<number[]>()
  const setFormPath = useFormContext()[1]
  const template = Array.isArray(templates) ? templates[0] : templates

  useEffect(() => {
    if (pendingPath && Node.has(editor, pendingPath)) {
      setFormPath(pendingPath)
      setPendingPath(undefined)
    }
  }, [editor, pendingPath])

  return (
    <IconButton
      Icon={IconAdd}
      onClick={(e) => {
        e.preventDefault()
        const insertPath = insertElement(editor, template, path, direction)
        setPendingPath(insertPath)
      }}
      title='insert new element'
      style={iconStyle}
      label={t(`editor/blockUi/new/${direction}`)}
      labelShort={t(`editor/blockUi/new/${direction}`)}
    />
  )
}

const Edit: React.FC<{
  path: number[]
  standalone?: boolean
}> = ({ path, standalone }) => {
  const { t } = useRenderContext()
  const setFormPath = useFormContext()[1]
  const label = standalone ? undefined : t('editor/blockUi/edit')
  return (
    <IconButton
      Icon={IconEdit}
      onClick={(e) => {
        e.preventDefault()
        setFormPath(path)
      }}
      title='edit element'
      style={{ ...iconStyle, padding: 3 }}
      size={18}
      label={label}
      labelShort={label}
    />
  )
}

const BlockUi: React.FC<{
  path: number[]
  element: CustomElement
}> = ({ path, element }) => {
  const template = element.template
  const config = elConfig[element.type].attrs?.blockUi
  const showEdit = !!elConfig[element.type].Form
  const showMoveUi = !!template?.repeat

  const editButton = <Edit path={path} standalone={!showMoveUi} />

  return (
    <span
      className='ui-element'
      {...styles.container}
      style={{ ...DEFAULT_POSITION, ...config?.style }}
      contentEditable={false}
    >
      {showMoveUi ? (
        <CalloutMenu
          Element={(props) => (
            <span {...props}>
              <IconMoreVertical size={24} />
            </span>
          )}
          elementProps={{ style: { display: 'flex' } }}
        >
          {showEdit && (
            <span style={{ display: 'block', ...iconStyle }}>{editButton}</span>
          )}
          {showMoveUi && [
            <MoveUp key='up' path={path} />,
            <MoveDown key='down' path={path} />,
            <Insert
              key='insertBefore'
              path={path}
              templates={template.type}
              direction='before'
            />,
            <Insert
              key='insertAfter'
              path={path}
              templates={template.type}
              direction='after'
            />,
            <Remove path={path} key='remove' />,
          ]}
        </CalloutMenu>
      ) : (
        editButton
      )}
    </span>
  )
}

export default BlockUi
