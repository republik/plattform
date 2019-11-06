export default storeKey => {
  const readStore = () => {
    let content
    try {
      content = JSON.parse(window.localStorage.getItem(storeKey)) || {}
    } catch (e) {
      content = null
    }
    return content
  }
  const supported = !!readStore()
  if (!supported) {
    return {
      key: storeKey,
      get: () => {},
      getAll: () => {},
      set: () => {},
      clear: () => {},
      supported
    }
  }

  return {
    key: storeKey,
    get: key => readStore()[key],
    getAll: () => readStore(),
    set: (key, value) => {
      try {
        window.localStorage.setItem(
          storeKey,
          JSON.stringify({
            ...readStore(),
            [key]: value
          })
        )
      } catch (e) {}
    },
    clear: () => {
      try {
        window.localStorage.removeItem(storeKey)
      } catch (e) {}
    },
    supported
  }
}

export const getKeys = () => {
  let keys = []
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      keys.push(window.localStorage.key(i))
    }
  } catch (e) {}
  return keys
}
