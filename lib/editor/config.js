const setupModules = modules => theme => {
  return Object.keys(modules).reduce(
    (acc, moduleName) => ({
      ...acc,
      [moduleName]: modules[moduleName](theme)
    }),
    {}
  )
}

const collectPlugins = modules => {
  return Object.keys(modules).reduce((acc, moduleName) => {
    const module = modules[moduleName]
    return module.Plugins
      ? [...acc, ...module.Plugins]
      : acc
  }, [])
}

const createSchema = modules => ({
  rules: Object.keys(modules).reduce((acc, moduleName) => {
    const module = modules[moduleName]
    return module.Rules ? [...acc, ...module.Rules] : acc
  }, [])
})

export default modules => theme => {
  const Modules = setupModules(modules)(theme)
  return {
    Modules,
    Plugins: collectPlugins(Modules),
    Schema: createSchema(Modules)
  }
}
