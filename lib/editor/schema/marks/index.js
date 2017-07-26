import createRule from '../utils/createRule'

export const Bold = createRule('mark', 'bold', props => {
  return <strong {...props} />
})

export const Italic = createRule('mark', 'italic', props =>
  <em {...props} />
)

export const Strikethrough = createRule(
  'mark',
  'strikethrough',
  props => <del {...props} />
)

export const Underline = createRule(
  'mark',
  'underline',
  props => <u {...props} />
)
