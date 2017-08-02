import { createElement } from 'react'

export const P = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.P'),
  render: props =>
    createElement(get('Typography.Blocks.P'), props)
})

export const H1 = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.H1'),
  render: props =>
    createElement(get('Typography.Blocks.H1'), props)
})

export const H2 = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.H2'),
  render: props =>
    createElement(get('Typography.Blocks.H2'), props)
})

export const H3 = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.H3'),
  render: props =>
    createElement(get('Typography.Blocks.H3'), props)
})

export const Lead = get => ({
  match: node =>
    node.kind === 'block' &&
    node.type === get('Typography.Constants.LEAD'),
  render: props =>
    createElement(get('Typography.Blocks.H3'), props)
})

export const Bold = get => ({
  match: node =>
    node.kind === 'mark' &&
    node.type === get('Typography.Constants.BOLD'),
  render: props =>
    createElement(get('Typography.Marks.Bold'), props)
})

export const Italic = get => ({
  match: node =>
    node.kind === 'mark' &&
    node.type === get('Typography.Constants.ITALIC'),
  rrender: props =>
    createElement(get('Typography.Marks.Italic'), props)
})

export const Strikethrough = get => ({
  match: node =>
    node.kind === 'mark' &&
    node.type === get('Typography.Constants.STRIKETHROUGH'),
  render: props =>
    createElement(
      get('Typography.Marks.Strikethrough'),
      props
    )
})

export const Underline = get => ({
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
