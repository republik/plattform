import { createElement } from 'react'

const P = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.P'),
  render: props =>
    createElement(get('Typography.Blocks.P'), props)
})

const H1 = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.H1'),
  render: props =>
    createElement(get('Typography.Blocks.H1'), props)
})

const H2 = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.H2'),
  render: props =>
    createElement(get('Typography.Blocks.H2'), props)
})

const H3 = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.H3'),
  render: props =>
    createElement(get('Typography.Blocks.H3'), props)
})

const Lead = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.LEAD'),
  render: props =>
    createElement(get('Typography.Blocks.Lead'), props)
})

const Bold = get => ({
  match: node =>
    node.kind === 'mark' &&
    node.type === get('Typography.Constants.BOLD'),
  render: props =>
    createElement(get('Typography.Marks.Bold'), props)
})

const Italic = get => ({
  match: node =>
    node.kind === 'mark' &&
    node.type === get('Typography.Constants.ITALIC'),
  rrender: props =>
    createElement(get('Typography.Marks.Italic'), props)
})

const Strikethrough = get => ({
  match: node =>
    node.kind === 'mark' &&
    node.type === get('Typography.Constants.STRIKETHROUGH'),
  render: props =>
    createElement(
      get('Typography.Marks.Strikethrough'),
      props
    )
})

const Underline = get => ({
  match: node =>
    node.kind === 'mark' &&
    node.type === get('Typography.Constants.UNDERLINE'),
  render: props =>
    createElement(get('Typography.Marks.Underline'), props)
})

export default get => [
  P(get),
  H1(get),
  H2(get),
  H3(get),
  Lead(get),
  Bold(get),
  Italic(get),
  Strikethrough(get),
  Underline(get)
]
