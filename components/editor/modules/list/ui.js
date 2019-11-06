import React from 'react'
import { Label, Checkbox } from '@project-r/styleguide'
import {
  matchBlock,
  createBlockButton,
  buttonStyles,
  createPropertyForm
} from '../../utils'
import createOnFieldChange from '../../utils/createOnFieldChange'
import injectBlock from '../../utils/injectBlock'
import UIForm from '../../UIForm'

export const ListForm = options => {
  const Form = ({ disabled, value, onChange, t }) => {
    if (disabled) {
      return null
    }
    // Multiple lists would involve more iteration work and given the fact, that this would happen on every select, I'd avoid it until necessary.
    const list = value.blocks.reduce(
      (memo, node) =>
        memo || value.document.getFurthest(node.key, matchBlock(options.TYPE)),
      undefined
    )

    const handlerFactory = createOnFieldChange(onChange, value, list)

    return (
      <div>
        <Label>Liste</Label>
        <UIForm>
          <Checkbox
            checked={list.data.get('compact')}
            onChange={handlerFactory('compact')}
          >
            Kompakt
          </Checkbox>
        </UIForm>
      </div>
    )
  }

  return createPropertyForm({
    isDisabled: ({ value }) => {
      const list = value.blocks.reduce(
        (memo, node) =>
          memo ||
          value.document.getFurthest(node.key, matchBlock(options.TYPE)),
        undefined
      )

      return !list
    }
  })(Form)
}

export const createListButton = ({
  TYPE,
  ordered,
  label,
  parentTypes,
  newBlock
}) =>
  createBlockButton({
    type: TYPE,
    parentTypes,
    reducer: props => event => {
      const { onChange, value } = props
      event.preventDefault()

      const inList = value.document.getClosest(
        value.startBlock.key,
        matchBlock(TYPE)
      )

      if (inList) {
        return onChange(
          value.change().setNodeByKey(inList.key, {
            data: inList.data.merge({
              ordered
            })
          })
        )
      }

      return onChange(value.change().call(injectBlock, newBlock({ ordered })))
    }
  })(({ active, disabled, visible, ...props }) => (
    <span
      {...buttonStyles.block}
      {...props}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
    >
      {label}
    </span>
  ))
