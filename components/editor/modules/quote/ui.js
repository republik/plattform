import React from 'react'
import { Block } from 'slate'

import { Radio, Label } from '@project-r/styleguide'

import {
  createPropertyForm,
  buttonStyles
} from '../../utils'

import injectBlock from '../../utils/injectBlock'

export default ({TYPE, subModules, editorOptions = {}, figureModule}) => {
  const {
    insertButtonText
  } = editorOptions

  const isBlock = block => block.type === TYPE || subModules.some(m => m.TYPE === block.type)
  const Form = createPropertyForm({
    isDisabled: ({ value }) => (
      !value.blocks.some(isBlock)
    )
  })(({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }

    return <div>
      {
        value.blocks
          .filter(isBlock)
          .map(block => block.type === TYPE
            ? block
            : value.document.getParent(block.key)
          )
          .filter((block, index, all) => all.indexOf(block) === index && block.type === TYPE)
          .map((block, i) => {
            return (
              <div key={`infobox-${i}`}>
                <Label>Zitat</Label><br />
                <p style={{margin: '10px 0'}}>
                  <Label>Ausrichtung</Label><br />
                  {[
                    {label: 'Normal', size: undefined},
                    {label: 'Klein', size: 'narrow'},
                    {label: 'Gross', size: 'breakout'},
                    {label: 'Links', size: 'float'}
                  ].map((size, i) => {
                    const checked = block.data.get('size') === size.size

                    return [
                      <Radio
                        key={`radio${i}`}
                        checked={checked}
                        onChange={event => {
                          event.preventDefault()
                          if (checked) return

                          let change = value.change()
                            .setNodeByKey(block.key, {
                              data: block.data.set('size', size.size)
                            })

                          onChange(change)
                        }}>
                        {size.label}
                      </Radio>,
                      <br key={`br${i}`} />
                    ]
                  })}
                </p>
              </div>
            )
          })
      }
    </div>
  })

  const quoteButtonClickHandler = (value, onChange) => event => {
    event.preventDefault()

    return onChange(
      value
        .change()
        .call(
          injectBlock,
          Block.create({
            type: TYPE,
            nodes: subModules.map(module => Block.create(module.TYPE))
          })
        )
    )
  }

  const insertTypes = editorOptions.insertTypes || []

  const QuoteButton = ({ value, onChange }) => {
    const disabled = value.isBlurred ||
      !value.blocks.every(n => insertTypes.includes(n.type))
    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={quoteButtonClickHandler(value, onChange)}
        >
        {insertButtonText}
      </span>
    )
  }

  return {
    insertButtons: [
      insertButtonText && QuoteButton
    ],
    forms: [Form]
  }
}
