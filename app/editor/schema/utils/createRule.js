const cleanProps = (keys, props) =>
  keys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: props[key]
    }),
    {}
  )

export const DEFAULT_PROPS = [
  'style',
  'className',
  'children',
  'id'
]

export default nodeKind => (
  nodeType,
  Component,
  filterProps = ['style', 'className', 'children', 'id']
) => ({
  match: ({ kind, type }) =>
    kind === 'block' && type === nodeType,
  render: props =>
    <Component {...cleanProps(filterProps, props)} />
})
