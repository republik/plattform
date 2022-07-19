import React, { useMemo } from 'react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  RemoveIcon,
} from '../../../../Icons'
import IconButton from '../../../../IconButton'
import { css } from 'glamor'
import { moveElement, removeElement } from '../helpers/structure'
import { useSlate } from 'slate-react'
import { useFormContext } from './Forms'
import { CustomElement } from '../../../custom-types'
import { config as elConfig } from '../../../config/elements'
import { element } from 'prop-types'

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
      style={iconStyle}
      disabled={isDisabled}
      title='move element up'
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
      style={iconStyle}
      disabled={isDisabled}
      title='move element down'
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
      style={{ ...iconStyle, padding: 4 }}
      title='edit element'
      size={16}
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
      style={iconStyle}
      disabled={isDisabled}
      title='remove element'
    />
  )
}

const BlockUi: React.FC<{
  path: number[]
  element: CustomElement
}> = ({ path, element }) => {
  return (
    <div className='ui-element' {...styles.container} contentEditable={false}>
      <MoveUp path={path} />
      <MoveDown path={path} />
      <Remove path={path} />
      {!!elConfig[element.type].Form && <Edit path={path} />}
    </div>
  )
}

export default BlockUi
