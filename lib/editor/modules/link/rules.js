import constants from './constants'

export const Link = ({ Link }) => ({
  match: node =>
    node.kind === 'inline' && node.type === constants.LINK,
  render: props => {
    const { node } = props
    return (
      <Link.Inlines.Link
        href={node.data.get('href')}
        {...props}
      />
    )
  }
})

export default opts => [Link(opts)]
