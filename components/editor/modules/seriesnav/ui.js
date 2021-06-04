import React from 'react'
import { buttonStyles, createPropertyForm, matchBlock } from '../../utils'
import { Radio, Label } from '@project-r/styleguide'
import injectBlock from '../../utils/injectBlock'

import UIForm from '../../UIForm'

const createSeriesNavUI = ({ TYPE, newBlock, zone }) => {
  const SeriesNavButton = ({ value, onChange }) => {
    const insertTypes = ['PARAGRAPH']
    const disabled =
      value.isBlurred ||
      !value.blocks.every(n => insertTypes.includes(n.type)) ||
      !value.document.data.has('series')
    const SeriesNavButtonClickHandler = event => {
      event.preventDefault()
      if (!disabled) {
        // onChange(
        //   value.change()
        //     .call(injectBlock, newBlock(value.document.data.toJS()))
        // )

        onChange(
          value
            .change()
            .insertNodeByKey(
              value.document.key,
              value.document.nodes.size,
              newBlock(value.document.data.toJS())
            )
        )
      }
    }

    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={SeriesNavButtonClickHandler}
      >
        Serien Navigation
      </span>
    )
  }

  const SeriesNavForm = ({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }
    const node = value.blocks.find(zone.match)
    if (!node) {
      return null
    }
    console.log('layout', node.data)
    return (
      <UIForm>
        <Label>Layout</Label>
        <Radio
          value='grid'
          checked={node.data.get('layout') === 'grid'}
          onChange={event => onChange('inline', null, event.target.value)}
        >
          Grid
        </Radio>
        <Radio
          value='inline'
          checked={node.data.get('layout') === 'inline'}
          onChange={event => onChange('inline', null, event.target.value)}
        >
          Inline
        </Radio>
      </UIForm>
    )
  }
  const SpecialForm = createPropertyForm({
    isDisabled: ({ value }) => {
      return !value.blocks.some(matchBlock(TYPE))
    }
  })(SeriesNavForm)

  return {
    forms: [SpecialForm],
    insertButtons: [SeriesNavButton]
  }
}

export default createSeriesNavUI
