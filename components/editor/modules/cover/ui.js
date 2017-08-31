import { Label } from '@project-r/styleguide'
import { ImagePropertyForm } from '../image/ui'
import { COVER } from './constants'
import {
  createPropertyForm,
  matchBlock
} from '../../utils'

export const CoverPropertyForm = ({ state, node, onChange }) => {
  return <span>
    <Label>Cover</Label>
    <ImagePropertyForm
      state={state}
      node={node}
      onChange={onChange}
    />
  </span>
}

export const CoverForm = createPropertyForm({
  isDisabled: ({ state }) => {
    return !state.blocks.some(block => {
      return matchBlock(COVER)(state.document.getParent(block.key))
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
    .find(matchBlock(COVER))
  return <CoverPropertyForm
    state={state}
    node={node}
    onChange={onChange}
    />
})
