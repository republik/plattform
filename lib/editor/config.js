const setupModules = modules => opts => {
  return Object.keys(modules).reduce(
    (acc, moduleName) => ({
      ...acc,
      [moduleName]: modules[moduleName](opts)
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

export default modules => opts => {
  const Modules = setupModules(modules)(opts)
  return {
    Modules,
    Plugins: collectPlugins(Modules),
    Schema: createSchema(Modules)
  }
}
