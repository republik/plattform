import constants from './constants'

export const P = ({ Typography }) => ({
  match: node =>
    node.kind === 'block' && node.type === constants.P,
  render: props => <Typography.Blocks.P {...props} />
})

export const H1 = ({ Typography }) => ({
  match: node =>
    node.kind === 'block' && node.type === constants.H1,
  render: props => <Typography.Blocks.H1 {...props} />
})

export const H2 = ({ Typography }) => ({
  match: node =>
    node.kind === 'block' && node.type === constants.H2,
  render: props => <Typography.Blocks.H2 {...props} />
})

export const H3 = ({ Typography }) => ({
  match: node =>
    node.kind === 'block' && node.type === constants.H3,
  render: props => <Typography.Blocks.H3 {...props} />
})

export const Lead = ({ Typography }) => ({
  match: node =>
    node.kind === 'block' && node.type === constants.LEAD,
  render: props => <Typography.Blocks.Lead {...props} />
})

export const Bold = ({ Typography }) => ({
  match: node =>
    node.kind === 'mark' && node.type === constants.BOLD,
  render: props => <Typography.Marks.Bold {...props} />
})

export const Italic = ({ Typography }) => ({
  match: node =>
    node.kind === 'mark' && node.type === constants.ITALIC,
  render: props => <Typography.Marks.Italic {...props} />
})

export const Strikethrough = ({ Typography }) => ({
  match: node =>
    node.kind === 'mark' &&
    node.type === constants.STRIKETHROUGH,
  render: props =>
    <Typography.Marks.Strikethrough {...props} />
})

export const Underline = ({ Typography }) => ({
  match: node =>
    node.kind === 'mark' &&
    node.type === constants.UNDERLINE,
  render: props => <Typography.Marks.Underline {...props} />
})

export default opts => [
  P(opts),
  H1(opts),
  H2(opts),
  H3(opts),
  Lead(opts),
  Bold(opts),
  Italic(opts),
  Strikethrough(opts),
  Underline(opts)
]
