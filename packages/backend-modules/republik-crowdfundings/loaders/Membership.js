const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = ({ pgdb }) => ({
  byId: createDataLoader(async (id) => {
    return pgdb.public.memberships.find({
      id: id,
    })
  }),
})
