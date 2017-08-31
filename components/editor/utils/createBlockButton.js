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
      return onChange(
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

export default ({ type, ...options }) =>
  Component =>
      createFormatButton({
        ...defaultOptions(type),
        ...options
      })(Component)
