import { Mark } from 'slate'
import { matchMark } from './'
import createFormatButton from './createFormatButton'

const isDisabled = markType => ({ value }) =>
  value.isBlurred || (value.isEmpty && !isActive(markType)({ value }))

const isActive = markType => ({ value }) =>
  value.marks.some(matchMark(markType))

const reducer = markType => props => event => {
  const { onChange, value } = props
  event.preventDefault()
  if (value.isEmpty) {
    const key = value.startKey
    const offset = value.startOffset
    const characters = value.texts.first().characters
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
      value
        .change()
        .removeMarkByKey(key, start, length, Mark.create({ type: markType }))
    )
  } else {
    let change = value.change()
    if (value.characters.first().text === ' ') {
      change = change.moveStart(1)
    }
    if (value.characters.last().text === ' ') {
      change = change.moveEnd(-1)
    }
    return onChange(change.toggleMark(markType))
  }
}

const defaultOptions = markType => ({
  isDisabled: isDisabled(markType),
  isActive: isActive(markType),
  reducer: reducer(markType)
})

export default ({ type, ...options }) => Component =>
  createFormatButton({
    ...defaultOptions(type),
    ...options
  })(Component)
