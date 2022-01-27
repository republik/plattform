const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = ({ pgdb }) => ({
  byId: createDataLoader((id) => {
    return pgdb.public.membershipTypes.find({ id })
  }),
})
