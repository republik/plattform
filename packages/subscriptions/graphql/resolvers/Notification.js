const { getObjectByIdAndType } = require('../../lib/genericObject')

module.exports = {
  object ({ eventId }, args, context) {
    const { loaders } = context
    return loaders.Event.byId.load(eventId)
      .then(e => getObjectByIdAndType(
        {
          id: e.objectId,
          type: e.objectType
        },
        context
      ))
  }
}
