import { createElement } from 'react'

const Link = get => ({
  match: node =>
    node.kind === 'inline' &&
    node.type === get('Link.Constants.LINK'),
  render: props => {
    const { node } = props
    return createElement(get('Link.Inlines.Link'), {
      ...props,
      href: node.data.get('href')
    })
  }
})

export default get => [Link(get)]
