module.exports = {
  upsert: async (table, data, condition) => {
    const where = condition || { id: data.id }

    try {
      if (Object.values(where).every(Boolean) && await table.findFirst(where)) {
        return {
          entity: await table.updateAndGetOne(where, data),
          isNew: false
        }
      }

      return {
        entity: await table.insertAndGet(data),
        isNew: true
      }
    } catch (e) {
      console.error(e.detail)
    }
  }
}
