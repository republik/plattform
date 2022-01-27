/**
 * If user has one or more roles from {settings.roles}, {settings.props}
 * is merged into {node.data.props}.
 *
 */
module.exports = (settings, node, user) => {
  const { roles, props } = settings

  if (roles?.some?.((role) => user?.roles?.includes?.(role))) {
    node.data.props = {
      ...node.data.props,
      ...props,
    }
  }
}
