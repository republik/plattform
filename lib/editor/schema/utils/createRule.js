export default (nodeKind, nodeType, Component) => ({
  match: ({ kind, type }) =>
    kind === nodeKind && type === nodeType,
  render: props => <Component {...props} />
})
