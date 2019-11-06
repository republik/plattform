import React, { useRef, Fragment } from 'react'
import { createBlockButton, buttonStyles, matchBlock } from '../../utils'
import injectBlock from '../../utils/injectBlock'
import { Text, Block } from 'slate'

import { LinkForm } from '../link/ui'

import { Checkbox, Label } from '@project-r/styleguide'

export default ({ TYPE }) => {
  const InsertButton = createBlockButton({
    type: TYPE,
    reducer: props => event => {
      const { onChange, value } = props
      event.preventDefault()

      return onChange(
        value.change().call(
          injectBlock,
          Block.create({
            kind: 'block',
            type: TYPE,
            data: { primary: true },
            nodes: [Text.create('Text')]
          })
        )
      )
    }
  })(({ active, disabled, visible, ...props }) => {
    return (
      <span
        {...buttonStyles.block}
        {...props}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
      >
        Button
      </span>
    )
  })

  const CheckboxOption = ({ label, value, node, onChange }) => {
    const checked = useRef()
    checked.current = node.data.get(label)

    return (
      <div style={{ margin: '10px 0', textTransform: 'capitalize' }}>
        <Checkbox
          checked={checked.current}
          onChange={_ => {
            let change = value.change().setNodeByKey(node.key, {
              data: node.data.merge({ [label]: !checked.current })
            })
            onChange(change)
          }}
        >
          {label}
        </Checkbox>
      </div>
    )
  }

  const Form = ({ value, onChange }) => {
    if (!value.blocks.some(matchBlock(TYPE))) {
      return null
    }

    const buttons = value.blocks.filter(matchBlock(TYPE))

    return (
      <div>
        <Label>Buttons</Label>
        {buttons.map((button, i) => (
          <Fragment key={i}>
            <CheckboxOption
              label='primary'
              value={value}
              node={button}
              onChange={onChange}
            />
            <CheckboxOption
              label='block'
              value={value}
              node={button}
              onChange={onChange}
            />
            <LinkForm
              kind='block'
              TYPE={TYPE}
              nodes={[button]}
              value={value}
              onChange={onChange}
            />
          </Fragment>
        ))}
      </div>
    )
  }

  return {
    forms: [Form],
    insertButtons: [InsertButton]
  }
}
