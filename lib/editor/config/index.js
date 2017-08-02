import modules from './modules'
import plugins from './plugins'
import schema from './schema'

export default m => opts => {
  const Modules = modules(m)(opts)
  return {
    Modules,
    Plugins: plugins(Modules),
    Schema: schema(Modules)
  }
}
