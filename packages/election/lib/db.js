module.exports = {
  upsert: async (table, data, condition) => {
    const where = condition || {id: data.id}
    try {
      if (Object.values(where).every(Boolean) && await table.findFirst(where)) {
        return table.updateAndGetOne(where, data)
      } else {
        return table.insertAndGet(data)
      }
    } catch (e) {
      console.error(e.detail)
    }
  }
}
