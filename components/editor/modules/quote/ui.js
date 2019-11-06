import React from 'react'
import { Block } from 'slate'

import { Radio, Label, A } from '@project-r/styleguide'

import { createPropertyForm, buttonStyles } from '../../utils'

import injectBlock from '../../utils/injectBlock'

export default ({
  TYPE,
  subModules,
  editorOptions = {},
  paragrapQuoteModule,
  paragraphSourceModule,
  figureModule
}) => {
  const { insertButtonText } = editorOptions

  const isBlock = block =>
    block.type === TYPE || subModules.some(m => m.TYPE === block.type)
  const Form = createPropertyForm({
    isDisabled: ({ value }) => !value.blocks.some(isBlock)
  })(({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }

    return (
      <div>
        {value.blocks
          .filter(isBlock)
          .map(block =>
            block.type === TYPE ? block : value.document.getParent(block.key)
          )
          .filter(
            (block, index, all) =>
              all.indexOf(block) === index && block.type === TYPE
          )
          .map((block, i) => {
            const figureNode =
              figureModule &&
              block.nodes.find(n => n.type === figureModule.TYPE)
            return (
              <div key={`infobox-${i}`}>
                <Label>Zitat</Label>
                <br />
                <p style={{ margin: '10px 0' }}>
                  <Label>Ausrichtung</Label>
                  <br />
                  {[
                    { label: 'Normal', size: undefined },
                    { label: 'Klein', size: 'narrow' },
                    { label: 'Gross', size: 'breakout' },
                    { label: 'Links', size: 'float' }
                  ].map((size, i) => {
                    const checked = block.data.get('size') === size.size

                    return [
                      <Radio
                        key={`radio${i}`}
                        checked={checked}
                        onChange={event => {
                          event.preventDefault()
                          if (checked) return

                          let change = value.change().setNodeByKey(block.key, {
                            data: block.data.set('size', size.size)
                          })

                          onChange(change)
                        }}
                      >
                        {size.label}
                      </Radio>,
                      <br key={`br${i}`} />
                    ]
                  })}
                </p>
                {figureModule && (
                  <p style={{ margin: '10px 0' }}>
                    {figureNode ? (
                      <A
                        href='#'
                        onClick={e => {
                          e.preventDefault()
                          onChange(
                            value.change().removeNodeByKey(figureNode.key)
                          )
                        }}
                      >
                        Bild entfernen
                      </A>
                    ) : (
                      <A
                        href='#'
                        onClick={e => {
                          e.preventDefault()
                          onChange(
                            value.change().insertNodeByKey(block.key, 0, {
                              kind: 'block',
                              type: figureModule.TYPE
                            })
                          )
                        }}
                      >
                        Bild hinzufügen
                      </A>
                    )}
                  </p>
                )}
              </div>
            )
          })}
      </div>
    )
  })

  const quoteButtonClickHandler = (value, onChange) => event => {
    event.preventDefault()

    return onChange(
      value.change().call(
        injectBlock,
        Block.create({
          type: TYPE,
          nodes: [
            Block.create(paragrapQuoteModule.TYPE),
            Block.create(paragraphSourceModule.TYPE)
          ]
        })
      )
    )
  }

  const insertTypes = editorOptions.insertTypes || []

  const QuoteButton = ({ value, onChange }) => {
    const disabled =
      value.isBlurred || !value.blocks.every(n => insertTypes.includes(n.type))
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
    insertButtons: [insertButtonText && QuoteButton],
    forms: [Form]
  }
}
