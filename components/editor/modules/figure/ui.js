import React from 'react'
import { Map } from 'immutable'
import { Radio, Label, Checkbox } from '@project-r/styleguide'
import withT from '../../../../lib/withT'

import { createPropertyForm, buttonStyles } from '../../utils'
import injectBlock from '../../utils/injectBlock'
import MetaForm from '../../utils/MetaForm'

function createUI({
  TYPE,
  FIGURE_IMAGE,
  FIGURE_CAPTION,
  newBlock,
  editorOptions,
  t
}) {
  const isFigureBlock = block =>
    block.type === FIGURE_IMAGE || block.type === FIGURE_CAPTION

  const {
    sizes = [],
    captionRight = false,
    pixelNote = false,
    insertButtonText
  } = editorOptions || {}

  const FigureForm = createPropertyForm({
    isDisabled: ({ value }) => {
      return !value.blocks.some(isFigureBlock)
    }
  })(
    withT(({ disabled, value, onChange, t }) => {
      if (disabled) {
        return null
      }
      return (
        <div>
          {value.blocks
            .filter(isFigureBlock)
            .map(block =>
              block.type === TYPE ? block : value.document.getParent(block.key)
            )
            .filter(block => block.type === TYPE)
            .filter((block, index, all) => all.indexOf(block) === index)
            .map((block, i) => {
              const parent = value.document.getParent(block.key)
              const imageBlock = block.nodes.find(n => n.type === FIGURE_IMAGE)
              const captionBlock = block.nodes.find(
                n => n.type === FIGURE_CAPTION
              )
              const onInputChange = subject => key => (_, val) => {
                onChange(
                  value.change().setNodeByKey(subject.key, {
                    data: val
                      ? subject.data.set(key, val)
                      : subject.data.remove(key)
                  })
                )
              }

              const applicableSizes = sizes.filter(size => {
                if (size.parent) {
                  if (
                    size.parent.kinds &&
                    !size.parent.kinds.find(kind => kind === parent.kind)
                  ) {
                    return false
                  }
                  if (
                    parent.type &&
                    size.parent.types &&
                    !size.parent.types.find(type => type === parent.type)
                  ) {
                    return false
                  }
                }
                return true
              })

              return (
                <div key={`figure-${i}`}>
                  <MetaForm
                    data={Map({
                      src: '',
                      alt: ''
                    }).merge(imageBlock.data)}
                    onInputChange={onInputChange(imageBlock)}
                  />
                  {captionRight && (
                    <MetaForm
                      data={Map({
                        captionRight:
                          captionBlock.data.get('captionRight') || false
                      })}
                      onInputChange={onInputChange(captionBlock)}
                    />
                  )}
                  {!!applicableSizes.length && (
                    <p style={{ margin: '10px 0' }}>
                      <Label>Ausrichtung</Label>
                      <br />
                      {applicableSizes.map((size, i) => {
                        let checked = Object.keys(size.props).every(
                          key => block.data.get(key) === size.props[key]
                        )
                        if (size.unwrap) {
                          checked = checked && parent.kind === 'document'
                        }
                        if (size.wrap) {
                          checked = checked && parent.type === size.wrap
                        }

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
                                  data: block.data.merge(size.props)
                                })

                              if (size.unwrap) {
                                for (
                                  let i = value.document.getDepth(block.key);
                                  i > 1;
                                  i--
                                ) {
                                  change = change.unwrapNodeByKey(block.key)
                                }
                              } else if (
                                size.wrap &&
                                parent.type !== size.wrap
                              ) {
                                change = change.wrapBlockByKey(block.key, {
                                  type: size.wrap
                                })
                              }

                              onChange(change)
                            }}
                          >
                            {size.label}
                          </Radio>,
                          <br key={`br${i}`} />
                        ]
                      })}
                    </p>
                  )}
                  {value.document.data.get('gallery') === true && (
                    <p>
                      <Checkbox
                        checked={block.data.get('excludeFromGallery') === true}
                        onChange={onInputChange(block)('excludeFromGallery')}
                      >
                        {t('metaData/field/excludeFromGallery')}
                      </Checkbox>
                    </p>
                  )}
                  {pixelNote && [
                    <Label key='pixelNote'>{pixelNote}</Label>,
                    <br key='pixelNoteBr' />
                  ]}
                  <br />
                </div>
              )
            })}
        </div>
      )
    })
  )

  const figureButtonClickHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    if (!disabled) {
      return onChange(value.change().call(injectBlock, newBlock()))
    }
  }
  const insertTypes = editorOptions.insertTypes || []

  const FigureButton = ({ value, onChange }) => {
    const disabled =
      value.isBlurred || !value.blocks.every(n => insertTypes.includes(n.type))

    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={figureButtonClickHandler(disabled, value, onChange)}
      >
        {insertButtonText}
      </span>
    )
  }

  return {
    forms: [FigureForm],
    insertButtons: [insertButtonText && FigureButton]
  }
}

export default createUI
