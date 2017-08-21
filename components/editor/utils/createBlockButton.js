import { matchBlock } from './'
import createFormatButton from './createFormatButton'

const isDisabled = blockType =>
  ({ state }) =>
    state.isBlurred || state.blocks.every(matchBlock(blockType))

const isActive = blockType =>
  ({ state }) =>
    state.blocks.some(matchBlock(blockType))

const reducer = blockType =>
  props =>
    event => {
      const { onChange, state } = props
      event.preventDefault()
      return onChange && onChange(
        state
          .transform()
          .setBlock(blockType)
          .apply()
      )
    }

const defaultOptions = blockType => ({
  isDisabled: isDisabled(blockType),
  isActive: isActive(blockType),
  reducer: reducer(blockType)
})

export default blockType => {
  const defaults = defaultOptions(blockType)
  return (Component, options) =>
    createFormatButton(
      Component,
      { ...defaults, ...options }
    )
}
