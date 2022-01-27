import React from 'react'

import { createPropertyForm, buttonStyles } from '../../utils'
import injectBlock from '../../utils/injectBlock'

import FilesInput from './FilesInput'

export default ({ TYPE, newBlock, editorOptions }) => {
  const isHtmlBlock = block => block.type === TYPE
  const { insertButtonText, insertTypes = [] } = editorOptions || {}

  const Form = createPropertyForm({
    isDisabled: ({ value }) => {
      return !value.blocks.some(isHtmlBlock)
    }
  })(({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }
    return (
      <div>
        {value.blocks.filter(isHtmlBlock).map((block, i) => {
          return (
            <div key={`html-${i}`}>
              <FilesInput
                data={block.data}
                onChange={files => {
                  console.log(files)
                  onChange(
                    value.change().setNodeByKey(block.key, {
                      data: block.data
                        .set('code', files.code)
                        .set('images', files.images)
                    })
                  )
                }}
              />
            </div>
          )
        })}
      </div>
    )
  })

  const buttonClickHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    if (!disabled) {
      return onChange(value.change().call(injectBlock, newBlock()))
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
    forms: [Form],
    insertButtons: [insertButtonText && Button]
  }
}
