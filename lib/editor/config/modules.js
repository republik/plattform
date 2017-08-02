export default modules => opts => {
  return Object.keys(modules).reduce(
    (acc, moduleName) => ({
      ...acc,
      [moduleName]: modules[moduleName](opts)
    }),
    {}
  )
}
