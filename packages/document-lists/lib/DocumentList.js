const find = (pgdb, query = {}) =>
  pgdb.public.documentLists.find(query)

const findOne = (pgdb, query = {}) =>
  pgdb.public.documentLists.findOne(query)

const findForUserQuery = (name) => `
  SELECT
    *
  FROM
    "documentLists"
  WHERE
    id IN (
      SELECT
        DISTINCT("documentListId") AS id
      FROM
        "documentListItems"
      WHERE
        "userId" = :userId
        ${name ? 'AND name = :name' : ''}
    )
`

const findForUser = (userId, pgdb) =>
  pgdb.query(
    findForUserQuery(),
    {
      userId
    }
  )
    .then(dls => dls
      .map(dl => Object.assign(dl, { userId }))
    )

const byNameForUser = (name, userId, pgdb) =>
  pgdb.query(
    findForUserQuery(name),
    {
      name,
      userId
    }
  )
    .then(dls => dls
      .map(dl => Object.assign(dl, { userId }))
      .pop()
    )

const insert = (userId, documentListId, repoId, pgdb) =>
  pgdb.public.documentListItems.insert({
    userId,
    documentListId,
    repoId
  })

module.exports = {
  find,
  findOne,
  findForUser,
  byNameForUser,
  insert
}
