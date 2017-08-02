export default modules => ({
  rules: Object.keys(modules).reduce((acc, moduleName) => {
    const module = modules[moduleName]
    return module.Rules ? [...acc, ...module.Rules] : acc
  }, [])
})
