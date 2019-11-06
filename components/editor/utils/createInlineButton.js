import { matchInline } from './'
import createFormatButton from './createFormatButton'

const isDisabled = (inlineType, parentTypes) => ({ value }) =>
  value.isBlurred ||
  (!isActive(inlineType)({ value }) &&
    (value.isEmpty ||
      (parentTypes &&
        !value.blocks.every(block => parentTypes.includes(block.type)))))

const isActive = inlineType => ({ value }) =>
  value.inlines.some(matchInline(inlineType))

const reducer = inlineType => props => event => {
  event.preventDefault()
  const { onChange, value } = props
  const active = isActive(inlineType)(props)

  if (active) {
    return onChange(value.change().unwrapInline(inlineType))
  } else if (value.isExpanded) {
    return onChange(
      value.change().wrapInline({
        type: inlineType
      })
    )
  }
}

const defaultOptions = (inlineType, parentTypes) => ({
  isDisabled: isDisabled(inlineType, parentTypes),
  isActive: isActive(inlineType),
  reducer: reducer(inlineType)
})

export default options => Component =>
  createFormatButton({
    ...defaultOptions(options.type, options.parentTypes),
    ...options
  })(Component)
