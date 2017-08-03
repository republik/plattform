import createEditor from './components/createEditor'

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

export default moduleConstructors => theme => {
  const Modules = setupModules(moduleConstructors)(theme)
  const Plugins = collectPlugins(Modules)
  return {
    Modules,
    Plugins,
    Editor: createEditor({ Modules, Plugins })
  }
}
