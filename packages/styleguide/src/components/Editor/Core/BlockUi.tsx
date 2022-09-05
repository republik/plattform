import React, { useEffect, useMemo, useState } from 'react'
import {
  AddIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  DeleteIcon,
  MoreIcon,
} from '../../Icons'
import IconButton from '../../IconButton'
import { css } from 'glamor'
import { insertAfter, moveElement, removeElement } from './helpers/structure'
import { useSlate } from 'slate-react'
import { useFormContext } from './Forms'
import { CustomElement, TemplateType } from '../custom-types'
import { config as elConfig } from '../config/elements'
import CalloutMenu from '../../Callout/CalloutMenu'
import colors from '../../../theme/colors'
import { Node } from 'slate'
import { toTitle } from './helpers/text'

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
  const editor = useSlate()
  const isDisabled = useMemo(
    () => !moveElement(editor, path, 'up', true),
    [path],
  )
  return (
    <IconButton
      Icon={ArrowUpIcon}
      onMouseDown={(e) => {
        e.preventDefault()
        moveElement(editor, path, 'up')
      }}
      disabled={isDisabled}
      title='move element up'
      style={iconStyle}
      label='Move up'
    />
  )
}

const MoveDown: React.FC<{
  path: number[]
}> = ({ path }) => {
  const editor = useSlate()
  const isDisabled = useMemo(
    () => !moveElement(editor, path, 'down', true),
    [path],
  )
  return (
    <IconButton
      Icon={ArrowDownIcon}
      onMouseDown={(e) => {
        e.preventDefault()
        moveElement(editor, path, 'down')
      }}
      disabled={isDisabled}
      title='move element down'
      style={iconStyle}
      label='Move down'
    />
  )
}

const Remove: React.FC<{
  path: number[]
}> = ({ path }) => {
  const editor = useSlate()
  const isDisabled = useMemo(() => !removeElement(editor, path, true), [path])
  return (
    <IconButton
      Icon={DeleteIcon}
      fill={colors.error}
      onMouseDown={(e) => {
        e.preventDefault()
        removeElement(editor, path)
      }}
      disabled={isDisabled}
      title='remove element'
      style={iconStyle}
      label='Delete'
    />
  )
}

const Insert: React.FC<{
  path: number[]
  templates: TemplateType | TemplateType[]
}> = ({ path, templates }) => {
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
      Icon={AddIcon}
      onMouseDown={(e) => {
        e.preventDefault()
        const insertPath = insertAfter(editor, template, path)
        setPendingPath(insertPath)
      }}
      title='insert new element'
      style={iconStyle}
      label='Insert new'
    />
  )
}

const Edit: React.FC<{
  path: number[]
}> = ({ path }) => {
  const setFormPath = useFormContext()[1]
  return (
    <IconButton
      Icon={EditIcon}
      onMouseDown={(e) => {
        e.preventDefault()
        setFormPath(path)
      }}
      title='edit element'
      style={{ ...iconStyle, padding: 3 }}
      size={18}
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

  const editButton = <Edit path={path} />

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
              <MoreIcon size={24} />
            </span>
          )}
          elementProps={{ style: { display: 'flex' } }}
        >
          {showEdit && editButton}
          {showMoveUi && [
            <MoveUp key='up' path={path} />,
            <MoveDown key='down' path={path} />,
            <Insert key='insert' path={path} templates={template.type} />,
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
