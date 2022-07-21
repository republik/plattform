import { inQuotes } from '@project-r/styleguide'
import { ascending } from 'd3-array'
import { intersperse } from '../../../lib/utils/helpers'

const insetBr = (text) =>
  intersperse(text.split('\n'), (_, i) => <br key={i} />)

const AnswerText = ({ text, value, question }) => {
  if (text) {
    return insetBr(text)
  }
  if (question.options) {
    const selectedOptions = question.options.filter((option) =>
      value.includes(option.value),
    )
    return selectedOptions.map((option) => option.label).join(', ')
  }
  if (question.ticks) {
    const closest = question.ticks
      .map((tick) => ({
        distance: Math.abs(tick.value - value),
        tick,
      }))
      .sort((a, b) => ascending(a.distance, b.distance))[0]
    return (
      <>
        {closest.distance !== 0 && 'Am ehesten '}
        {inQuotes(closest.tick.label || closest.tick.value)}
      </>
    )
  }

  return insetBr(value)
}

export default AnswerText
