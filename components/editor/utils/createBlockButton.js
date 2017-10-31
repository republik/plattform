import { matchBlock } from './'
import createFormatButton from './createFormatButton'

const isDisabled = blockType =>
  ({ value }) =>
    value.isBlurred || value.blocks.every(matchBlock(blockType))

const isActive = blockType =>
  ({ value }) =>
    value.blocks.some(matchBlock(blockType))

const reducer = blockType =>
  props =>
    event => {
      const { onChange, value } = props
      event.preventDefault()
      return onChange(
        value
          .change()
          .setBlock(blockType)
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
