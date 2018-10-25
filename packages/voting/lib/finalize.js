module.exports = async (entityName, entity, entityResult, args, pgdb) => {
  if (!entityName) {
    throw new Error('missing entityName')
  }
  if (!entity) {
    throw new Error('missing entity')
  }
  const { message, video } = args

  const now = new Date()
  const result = {
    ...entityResult,
    updatedAt: now,
    createdAt: entity.result ? entity.result.createdAt : now,
    message,
    video
  }

  const updatedEntity = await pgdb.public[entityName].updateAndGetOne(
    { id: entity.id },
    { result }
  )
  return updatedEntity.result
}
