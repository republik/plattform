import React from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '../../../../Icons'
import IconButton from '../../../../IconButton'

const BlockUi = () => {
  // TODO: get custom styles from config
  const stylesFromProps = { color: 'white', top: 30, right: 6 }
  return (
    <div
      className='ui-element'
      style={{ userSelect: 'none', position: 'absolute', ...stylesFromProps }}
      contentEditable={false}
    >
      <IconButton
        size={36}
        fill='white'
        Icon={ArrowUpIcon}
        onClick={() => undefined}
      />
      <IconButton
        size={36}
        fill='white'
        Icon={ArrowDownIcon}
        onClick={() => undefined}
      />
    </div>
  )
}

export default BlockUi
