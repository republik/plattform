import React from 'react'

import injectBlock from '../../utils/injectBlock'
import { buttonStyles } from '../../utils'

export default ({ TYPE, CANVAS_TYPE, newBlock, editorOptions }) => {
  const { insertButtonText, insertTypes = [] } = editorOptions || {}

  const insertHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    if (!disabled) {
      return onChange(value.change().call(injectBlock, newBlock()))
    }
  }
  const InsertButton = ({ value, onChange }) => {
    const disabled =
      value.isBlurred || !value.blocks.every(n => insertTypes.includes(n.type))

    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={insertHandler(disabled, value, onChange)}
      >
        {insertButtonText}
      </span>
    )
  }

  return {
    insertButtons: [insertButtonText && InsertButton]
  }
}
