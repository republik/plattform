const stringify = require('json-stable-stringify')
const fakeUUID = require('./fakeUUID')

module.exports = {
  getSelectionArgsForField: (info, fieldName) => {
    const selection = info.fieldNodes[0].selectionSet.selections.find(s => s.name.value === fieldName)
    let args = {}
    selection.arguments.forEach(a => {
      args[a.name.value] = a.value.value
    })
    return args
  },
  getUUIDForSelectionArgs: (args, uuid) => fakeUUID(uuid + stringify(args))
}
