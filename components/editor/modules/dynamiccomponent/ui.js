import React from 'react'

import { buttonStyles } from '../../utils'
import injectBlock from '../../utils/injectBlock'

export default ({ TYPE, newItem, editorOptions }) => {
  const { insertButtonText, insertTypes = [] } = editorOptions || {}

  const buttonClickHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    if (!disabled) {
      return onChange(value.change().call(injectBlock, newItem()))
    }
  }

  const Button = ({ value, onChange }) => {
    const disabled =
      value.isBlurred || !value.blocks.every(n => insertTypes.includes(n.type))

    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={buttonClickHandler(disabled, value, onChange)}
      >
        {insertButtonText}
      </span>
    )
  }

  return {
    insertButtons: [insertButtonText && Button]
  }
}
