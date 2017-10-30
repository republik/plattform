import React from 'react'
import { Map } from 'immutable'

import { Label } from '@project-r/styleguide'

import MetaForm from '../../utils/MetaForm'

import {
  createPropertyForm,
  matchBlock
} from '../../utils'

export const createCoverForm = TYPE => createPropertyForm({
  isDisabled: ({ state }) => {
    return !state.blocks.some(block => {
      return matchBlock(TYPE)(state.document.getParent(block.key))
    })
  }
})(({ disabled, state, onChange }) => {
  if (disabled) {
    return null
  }
  const node = state.blocks
    .map(
      block => state.document.getParent(block.key)
    )
    .find(matchBlock(TYPE))

  const onInputChange = key => (_, value) => {
    onChange(
      state
        .change()
        .setNodeByKey(node.key, {
          data: value
            ? node.data.set(key, value)
            : node.data.remove(key)
        })
    )
  }

  return <div>
    <Label>Cover</Label>
    <MetaForm
      data={Map({
        src: '',
        alt: ''
      }).merge(node.data)}
      onInputChange={onInputChange}
    />
    <Label>Anzeigegrössen: 2000x1125 und 1280x675 (zentrierter Schnitt)</Label>
  </div>
})
