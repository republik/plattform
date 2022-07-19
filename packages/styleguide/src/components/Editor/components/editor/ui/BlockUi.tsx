import React, { useMemo } from 'react'
import {
  AddIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  RemoveIcon,
} from '../../../../Icons'
import IconButton from '../../../../IconButton'
import { css } from 'glamor'
import { insertAfter, moveElement, removeElement } from '../helpers/structure'
import { useSlate } from 'slate-react'
import { useFormContext } from './Forms'
import {
  CustomElement,
  CustomElementsType,
  TemplateType,
} from '../../../custom-types'
import { config as elConfig } from '../../../config/elements'

const styles = {
  container: css({
    userSelect: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    background: 'white',
    padding: 5,
    opacity: 0.8,
  }),
  padded: css({
    marginBottom: 8,
  }),
}

const iconStyle = { marginRight: 0 }

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
      onClick={() => moveElement(editor, path, 'up')}
      disabled={isDisabled}
      title='move element up'
      style={iconStyle}
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
      onClick={() => moveElement(editor, path, 'down')}
      disabled={isDisabled}
      title='move element down'
      style={iconStyle}
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
      Icon={RemoveIcon}
      onClick={() => removeElement(editor, path)}
      disabled={isDisabled}
      title='remove element'
      style={iconStyle}
    />
  )
}

const Insert: React.FC<{
  path: number[]
  choice: TemplateType | TemplateType[]
}> = ({ path, choice }) => {
  const editor = useSlate()

  // TODO: choose type here
  if (Array.isArray(choice)) return null

  return (
    <IconButton
      Icon={AddIcon}
      onClick={() => insertAfter(editor, choice as CustomElementsType, path)}
      title='insert new element'
      style={iconStyle}
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
      onClick={() => setFormPath(path)}
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
  // this UI is here to manage repeatable, interchangeable elements
  if (!template?.repeat) return null
  return (
    <div className='ui-element' {...styles.container} contentEditable={false}>
      {!!elConfig[element.type].Form && (
        <div {...styles.padded}>
          <Edit path={path} />
        </div>
      )}
      <div {...styles.padded}>
        <MoveUp path={path} />
        <MoveDown path={path} />
      </div>
      <Remove path={path} />
      <Insert path={path} choice={template.type} />
    </div>
  )
}

export default BlockUi
