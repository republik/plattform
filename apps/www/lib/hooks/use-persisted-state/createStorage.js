const createStorage = (provider) => ({
  get(key, defaultValue) {
    const json = provider.getItem(key)
    // eslint-disable-next-line no-nested-ternary
    return json === null
      ? typeof defaultValue === 'function'
        ? defaultValue()
        : defaultValue
      : JSON.parse(json)
  },
  set(key, value) {
    if (value === undefined) {
      provider.removeItem(key)
    } else {
      provider.setItem(key, JSON.stringify(value))
    }
  },
})

export default createStorage
