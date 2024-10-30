import { Block } from 'slate'

import { Radio, Label } from '@project-r/styleguide'

import { createPropertyForm, buttonStyles } from '../../utils'

import injectBlock from '../../utils/injectBlock'
import { matchSubmodules } from '../../utils/matchers'

export default ({
  TYPE,
  subModules,
  editorOptions = {},
}) => {
  const { insertButtonText } = editorOptions
  const [numberModule, figureCaptionModule] = subModules

  const isBlock = (block) => matchSubmodules(TYPE, subModules)
  const Form = createPropertyForm({
    isDisabled: ({ value }) => !value.blocks.some(isBlock),
  })(({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }

    return (
      <div>
        {value.blocks
          .filter(isBlock)
          .map((block) =>
            block.type === TYPE ? block : value.document.getParent(block.key),
          )
          .filter(
            (block, index, all) =>
              all.indexOf(block) === index && block.type === TYPE,
          )
          .map((block, i) => {
            return (
              <div key={`infobox-${i}`}>
                <Label>Grosse Zahle</Label>
                <br />
                <p style={{ margin: '10px 0' }}>
                  <Label>Farbe</Label>
                  <br />
                  {[
                    { label: 'normal', color: undefined },
                    { label: 'Rot', color: 'red' },
                    { label: 'Blau', color: 'blue' },
                  ].map((option, i) => {
                    const checked = block.data.get('color') === option.color

                    return [
                      <Radio
                        key={`radio${i}`}
                        checked={checked}
                        onChange={(event) => {
                          event.preventDefault()
                          if (checked) return

                          let change = value.change().setNodeByKey(block.key, {
                            data: block.data.set('color', option.color),
                          })

                          onChange(change)
                        }}
                      >
                        {option.label}
                      </Radio>,
                      <br key={`br${i}`} />,
                    ]
                  })}
                </p>
              </div>
            )
          })}
      </div>
    )
  })

  const quoteButtonClickHandler = (value, onChange) => (event) => {
    event.preventDefault()

    return onChange(
      value.change().call(
        injectBlock,
        Block.create({
          type: TYPE,
          nodes: [
            Block.create(numberModule.TYPE),
            Block.create(figureCaptionModule.TYPE),
          ],
        }),
      ),
    )
  }

  const insertTypes = editorOptions.insertTypes || []

  const QuoteButton = ({ value, onChange }) => {
    const disabled =
      value.isBlurred ||
      !value.blocks.every((n) => insertTypes.includes(n.type))
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
    forms: [Form],
  }
}
