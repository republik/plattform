import { matchInline } from './'
import createFormatButton from './createFormatButton'

const isDisabled = inlineType =>
  ({ value }) =>
    value.isBlurred || (
      !isActive(inlineType)({ value }) &&
      value.isEmpty
    )

const isActive = inlineType =>
  ({ value }) =>
    value.inlines.some(matchInline(inlineType))

const reducer = inlineType =>
  props =>
    event => {
      event.preventDefault()
      const { onChange, value } = props
      const active = isActive(inlineType)(props)

      if (active) {
        return onChange(
          value
            .change()
            .unwrapInline(inlineType)
        )
      } else if (value.isExpanded) {
        return onChange(value
          .change()
          .wrapInline({
            type: inlineType
          })
        )
      }
    }

const defaultOptions = inlineType => ({
  isDisabled: isDisabled(inlineType),
  isActive: isActive(inlineType),
  reducer: reducer(inlineType)
})

export default ({ type, ...options }) =>
  Component =>
      createFormatButton({
        ...defaultOptions(type),
        ...options
      })(Component)
