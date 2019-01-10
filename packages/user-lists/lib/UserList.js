const findForUser = (userId, { pgdb }) =>
  pgdb.public.userLists.find({
    hidden: false
  })
    .then(dls => dls
      .map(dl => Object.assign(dl, { userId }))
    )

const byNameForUser = (name, userId, { loaders }) =>
  loaders.UserList.byKeyObj.load({
    name
  })
    .then(dl => dl
      ? Object.assign(dl, { userId })
      : null
    )

const byIdForUser = (id, userId, { loaders }) =>
  loaders.UserList.byKeyObj.load({ id })
    .then(dl => dl
      ? Object.assign(dl, { userId })
      : null
    )

const findDocumentItems = (args, { pgdb }) =>
  pgdb.public.userListDocumentItems.find(args)

const upsertDocumentItem = async (userId, userListId, repoId, data, pgdb) => {
  const query = {
    userId,
    userListId,
    repoId
  }
  const existingItem =
    await pgdb.public.userListDocumentItems.findOne(query)
  if (!existingItem) {
    return pgdb.public.userListDocumentItems.insert(
      {
        ...query,
        data
      },
      { skipUndefined: true }
    )
  } else {
    return pgdb.public.userListDocumentItems.update(
      {
        id: existingItem.id
      },
      {
        ...query,
        data
      },
      { skipUndefined: true }
    )
  }
}

const deleteDocumentItem = (userId, userListId, repoId, pgdb) =>
  pgdb.public.userListDocumentItems.delete({
    userId,
    userListId,
    repoId
  })

module.exports = {
  findForUser,
  byNameForUser,
  byIdForUser,
  findDocumentItems,
  upsertDocumentItem,
  deleteDocumentItem
}
