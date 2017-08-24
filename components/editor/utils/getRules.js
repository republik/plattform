export default plugins => plugins.reduce(
  (all, plugin) => all.concat((plugin.schema || {}).rules).filter(Boolean),
  []
)
