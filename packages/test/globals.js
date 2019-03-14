const setGlobals = (scope, payload) =>
  Object.keys(payload).forEach( key => {
    global[`${scope}.${key}`] = payload[key]
  })

const getGlobal = (scope, key) =>
  global[`${scope}.${key}`]


module.exports = {
  setGlobals,
  getGlobal
}
