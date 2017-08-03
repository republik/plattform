import createEditor from './components/createEditor'
import Typography from './modules/Typography'
import Document from './modules/Document'
import Link from './modules/Link'
import Image from './modules/Image'

const setupModules = moduleConstructors => theme => {
  return Object.keys(moduleConstructors).reduce(
    (reduction, moduleName) => ({
      ...reduction,
      [moduleName]: moduleConstructors[moduleName](theme)
    }),
    {}
  )
}

const collectPlugins = modules => {
  return Object.keys(
    modules
  ).reduce((reduction, moduleName) => {
    const module = modules[moduleName]
    return module.Plugins
      ? [...reduction, ...module.Plugins]
      : reduction
  }, [])
}

export const create = moduleConstructors => theme => {
  const Modules = setupModules(moduleConstructors)(theme)
  const Plugins = collectPlugins(Modules)
  return {
    Modules,
    Plugins,
    Editor: createEditor({ Modules, Plugins })
  }
}

export default create({
  Typography,
  Document,
  Link,
  Image
})
