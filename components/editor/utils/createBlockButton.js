import { matchBlock } from './'
import createFormatButton from './createFormatButton'

const isDisabled = (blockType, parentTypes) => ({ value }) =>
  value.isBlurred ||
  value.blocks.every(matchBlock(blockType)) ||
  (parentTypes &&
    !value.blocks.every(block => parentTypes.includes(block.type)))

const isActive = blockType => ({ value }) =>
  value.blocks.some(matchBlock(blockType))

const reducer = blockType => props => event => {
  const { onChange, value } = props
  event.preventDefault()
  return onChange(value.change().setBlock(blockType))
}

const defaultOptions = (blockType, parentTypes) => ({
  isDisabled: isDisabled(blockType, parentTypes),
  isActive: isActive(blockType),
  reducer: reducer(blockType)
})

export default options => Component =>
  createFormatButton({
    ...defaultOptions(options.type, options.parentTypes),
    ...options
  })(Component)
