import { Mark } from 'slate'
import { matchMark } from './'
import createFormatButton from './createFormatButton'

const isDisabled = markType =>
  ({ state }) =>
    state.isBlurred || (
        !isActive(markType)({ state }) &&
        state.isEmpty
    )

const isActive = markType =>
  ({ state }) =>
    state.marks.some(matchMark(markType))

const reducer = markType =>
  props =>
    event => {
      const { onChange, state } = props
      event.preventDefault()

      if (state.isEmpty) {
        const key = state.startKey
        const offset = state.startOffset
        const characters = state.texts.first().characters
        let i = offset
        let has = true
        while (has) {
          i--
          has = characters.get(i).marks.some(matchMark(markType))
        }
        const start = i
        i = offset
        has = true
        while (has) {
          i++
          has = characters.get(i).marks.some(matchMark(markType))
        }
        const end = i
        const length = end - start
        return onChange(
          state
          .transform()
          .removeMarkByKey(
            key,
            start,
            length,
            Mark.create({ type: markType })
          )
          .apply()
        )
      } else {
        return onChange(
          state.transform().toggleMark(markType).apply()
        )
      }
    }

const defaultOptions = markType => ({
  isDisabled: isDisabled(markType),
  isActive: isActive(markType),
  reducer: reducer(markType)
})

export default ({ type, ...options }) =>
  Component =>
    createFormatButton({
      ...defaultOptions(type),
      ...options
    })(Component)
