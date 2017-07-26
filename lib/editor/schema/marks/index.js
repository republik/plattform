import { createMarkRule } from '../utils'

export const Bold = createMarkRule('bold', props =>
  <strong {...props} />
)

export const Italic = createMarkRule('italic', props =>
  <em {...props} />
)

export const Strikethrough = createMarkRule(
  'strikethrough',
  props => <del {...props} />
)

export const Underline = createMarkRule(
  'underline',
  props => <u {...props} />
)
