import React from 'react'
import { Map } from 'immutable'
import { Block } from 'slate'

import { Radio, Label, A, Checkbox } from '@project-r/styleguide'

import { createPropertyForm, buttonStyles, matchBlock } from '../../utils'
import MetaForm from '../../utils/MetaForm'

import injectBlock from '../../utils/injectBlock'

export default ({
  TYPE,
  subModules,
  editorOptions = {},
  titleModule,
  paragraphModule,
  figureModule
}) => {
  const { insertButtonText } = editorOptions

  const isInfoboxBlock = block =>
    block.type === TYPE || subModules.some(m => m.TYPE === block.type)
  const Form = createPropertyForm({
    isDisabled: ({ value }) => !value.blocks.some(isInfoboxBlock)
  })(({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }

    return (
      <div>
        {value.blocks
          .filter(isInfoboxBlock)
          .map(block =>
            block.type === TYPE
              ? block
              : value.document.getClosest(block.key, matchBlock(TYPE))
          )
          .filter(
            (block, index, all) =>
              all.indexOf(block) === index && block.type === TYPE
          )
          .map((block, i) => {
            const onInputChange = subject => key => (_, val) => {
              onChange(
                value.change().setNodeByKey(subject.key, {
                  data: val
                    ? subject.data.set(key, val)
                    : subject.data.remove(key)
                })
              )
            }
            const figureNode =
              figureModule &&
              block.nodes.find(n => n.type === figureModule.TYPE)
            const floatSize = block.data.get('size') === 'float'

            return (
              <div key={`infobox-${i}`}>
                <Label>Infobox</Label>
                <br />
                <p style={{ margin: '10px 0' }}>
                  <Checkbox
                    checked={block.data.get('collapsable') === true}
                    onChange={onInputChange(block)('collapsable')}
                  >
                    aufklappbar
                  </Checkbox>
                </p>
                <p style={{ margin: '10px 0' }}>
                  <Label>Ausrichtung</Label>
                  <br />
                  {[
                    { label: 'Normal', size: undefined },
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
                            value.change().insertNodeByKey(block.key, 1, {
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
                {figureNode && !floatSize && (
                  <p style={{ margin: '10px 0' }}>
                    <Label>Bildgrösse</Label>
                    <br />
                    {['S', 'M', 'L'].map((figureSize, i) => {
                      const checked =
                        block.data.get('figureSize', 'S') === figureSize

                      return [
                        <Radio
                          key={`radio${i}`}
                          checked={checked}
                          onChange={event => {
                            event.preventDefault()
                            if (checked) return

                            let change = value
                              .change()
                              .setNodeByKey(block.key, {
                                data: block.data.set('figureSize', figureSize)
                              })

                            onChange(change)
                          }}
                        >
                          {figureSize}
                        </Radio>,
                        <br key={`br${i}`} />
                      ]
                    })}
                  </p>
                )}
                {figureNode && !floatSize && (
                  <MetaForm
                    data={Map({
                      figureFloat: block.data.get('figureFloat') || false
                    })}
                    onInputChange={onInputChange(block)}
                  />
                )}
              </div>
            )
          })}
      </div>
    )
  })

  const infoBoxButtonClickHandler = (value, onChange) => event => {
    event.preventDefault()
    return onChange(
      value.change().call(
        injectBlock,
        Block.create({
          type: TYPE,
          nodes: [
            Block.create(titleModule.TYPE),
            Block.create(paragraphModule.TYPE)
          ]
        })
      )
    )
  }
  const insertTypes = editorOptions.insertTypes || []

  const InfoboxButton = ({ value, onChange }) => {
    const disabled =
      value.isBlurred || !value.blocks.every(n => insertTypes.includes(n.type))
    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={infoBoxButtonClickHandler(value, onChange)}
      >
        {insertButtonText}
      </span>
    )
  }

  return {
    insertButtons: [insertButtonText && InfoboxButton],
    forms: [Form]
  }
}
