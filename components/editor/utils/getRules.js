const getRules = plugins => plugins.reduce(
  (all, plugin) => all.concat((plugin.schema || {}).rules).filter(Boolean),
  []
)

export default getRules

export const getSerializationRules = plugins =>
  getRules(plugins).filter(r => r.fromMdast || r.toMdast)
