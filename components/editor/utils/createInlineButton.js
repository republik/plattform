import { matchInline } from './'
import createFormatButton from './createFormatButton'

const isDisabled = inlineType =>
  ({ state }) =>
    state.isBlurred || (
      !isActive(inlineType)({ state }) &&
      state.isEmpty
    )

const isActive = inlineType =>
  ({ state }) =>
    state.inlines.some(matchInline(inlineType))

const reducer = inlineType =>
  props =>
    event => {
      event.preventDefault()
      const { onChange, state } = props
      const active = isActive(inlineType)(props)

      if (active) {
        return onChange(
          state
            .change()
            .unwrapInline(inlineType)
        )
      } else if (state.isExpanded) {
        return onChange(state
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
