export default modules => {
  return Object.keys(modules).reduce((acc, moduleName) => {
    const module = modules[moduleName]
    return module.Plugins
      ? [...acc, ...module.Plugins]
      : acc
  }, [])
}
