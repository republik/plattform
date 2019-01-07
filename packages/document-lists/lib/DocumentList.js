const find = (query = {}, { pgdb }) =>
  pgdb.public.documentLists.find(query)

const findForUser = (userId, context) =>
  find({}, context)
    .then(dls => dls
      .map(dl => Object.assign(dl, { userId }))
    )

const byNameForUser = (name, userId, { loaders }) =>
  loaders.DocumentList.byKeyObj.load({
    name
  })
    .then(dl => Object.assign(dl, { userId }))

const byId = (id, { loaders }) =>
  loaders.DocumentList.byKeyObj.load({ id })

const findItems = (args, { pgdb }) =>
  pgdb.public.documentListItems.find(args)

const upsert = async (userId, documentListId, repoId, pgdb) => {
  const query = {
    userId,
    documentListId,
    repoId
  }
  const count = await pgdb.public.documentListItems.count(query)
  if (count === 0) {
    return pgdb.public.documentListItems.insert(query)
  }
}

const del = (userId, documentListId, repoId, pgdb) =>
  pgdb.public.documentListItems.delete({
    userId,
    documentListId,
    repoId
  })

module.exports = {
  find,
  findForUser,
  byNameForUser,
  byId,
  findItems,
  upsert,
  del
}
