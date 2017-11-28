import React from 'react'
import { Map } from 'immutable'

import { Radio, Label } from '@project-r/styleguide'

import {
  createPropertyForm,
  createActionButton,
  buttonStyles
} from '../../utils'
import injectBlock from '../../utils/injectBlock'
import MetaForm from '../../utils/MetaForm'

export default ({TYPE, FIGURE_IMAGE, FIGURE_CAPTION, newBlock, editorOptions}) => {
  const isFigureBlock = block => block.type === FIGURE_IMAGE || block.type === FIGURE_CAPTION

  const {
    sizes = [],
    captionRight = false,
    pixelNote = false
  } = editorOptions || {}

  const FigureForm = createPropertyForm({
    isDisabled: ({ value }) => {
      return (
        !value.blocks.some(isFigureBlock)
      )
    }
  })(({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }
    return <div>
      {
        value.blocks
          .filter(isFigureBlock)
          .map(block => block.type === 'FIGURE'
            ? block
            : value.document.getParent(block.key)
          )
          .filter((block, index, all) => all.indexOf(block) === index)
          .map((block, i) => {
            const parent = value.document.getParent(block.key)
            const imageBlock = block.nodes.find(n => n.type === FIGURE_IMAGE)
            const captionBlock = block.nodes.find(n => n.type === FIGURE_CAPTION)
            const onInputChange = subject => key => (_, val) => {
              onChange(
                value
                  .change()
                  .setNodeByKey(subject.key, {
                    data: val
                      ? subject.data.set(key, val)
                      : subject.data.remove(key)
                  })
              )
            }

            return (
              <div key={`figure-${i}`}>
                <MetaForm
                  data={Map({
                    src: '',
                    alt: ''
                  }).merge(imageBlock.data)}
                  onInputChange={onInputChange(imageBlock)}
                />
                {pixelNote && [
                  <Label key='pixelNote'>{pixelNote}</Label>,
                  <br key='pixelNoteBr' />
                ]}
                <br />
                {captionRight && <MetaForm
                  data={Map({
                    captionRight: captionBlock.data.get('captionRight') || false
                  })}
                  onInputChange={onInputChange(captionBlock)}
                />}
                <p style={{margin: '10px 0'}}>
                  <Label>Ausrichtung</Label><br />
                  {sizes.map((size, i) => {
                    if (size.parent) {
                      if (size.parent.kinds && !size.parent.kinds.find(kind => kind === parent.kind)) {
                        return null
                      }
                      if (
                        parent.type &&
                        size.parent.types &&
                        !size.parent.types.find(type => type === parent.type)
                      ) {
                        return null
                      }
                    }

                    let checked = Object.keys(size.props).every(key => (
                      block.data.get(key) === size.props[key]
                    ))
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

                          let change = value.change()
                            .setNodeByKey(block.key, {
                              data: block.data.merge(size.props)
                            })

                          if (size.unwrap) {
                            for (let i = value.document.getDepth(block.key); i > 1; i--) {
                              change = change.unwrapNodeByKey(block.key)
                            }
                          } else if (size.wrap && parent.type !== size.wrap) {
                            change = change.wrapBlockByKey(
                              block.key,
                              {type: size.wrap}
                            )
                          }

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

  const FigureButton = createActionButton({
    isDisabled: ({ value }) => {
      return value.isBlurred
    },
    reducer: ({ value, onChange }) => event => {
      event.preventDefault()

      return onChange(
        value
          .change()
          .call(
            injectBlock,
            newBlock()
          )
      )
    }
  })(
    ({ disabled, visible, ...props }) =>
      <span
        {...buttonStyles.insert}
        {...props}
        data-disabled={disabled}
        data-visible={visible}
        >
        Bild
      </span>

  )

  return {
    forms: [FigureForm],
    insertButtons: [FigureButton]
  }
}
