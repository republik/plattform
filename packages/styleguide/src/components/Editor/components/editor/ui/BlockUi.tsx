import React, { useMemo } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '../../../../Icons'
import IconButton from '../../../../IconButton'
import { css } from 'glamor'
import { moveElement } from '../helpers/structure'
import { useSlate } from 'slate-react'

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
    />
  )
}

const BlockUi: React.FC<{
  path: number[]
}> = ({ path }) => {
  return (
    <div className='ui-element' {...styles.container} contentEditable={false}>
      <MoveUp path={path} />
      <MoveDown path={path} />
    </div>
  )
}

export default BlockUi
