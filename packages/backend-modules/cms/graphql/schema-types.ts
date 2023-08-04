import * as fs from 'node:fs'
import * as path from 'node:path'
import { getEntityPath, loadEntities } from '../lib/utils/EntityResolver'

// TODO: programmatically generate EntityEnum
// TODO: programmatically collect types from entities folder

const schema = (function () {
  const entities = loadEntities()
  const schema = []
  // read file ../lib/base.gql
  const base = fs.readFileSync(
    path.join(path.resolve(__dirname, '../lib'), 'base.gql'),
    'utf8',
  )
  schema.push(base)
  // read file ../lib/entities/<entity>/schema.gql
  entities.forEach((entity) => {
    const entityPath = getEntityPath(entity)
    const entityGQL = fs.readFileSync(path.join(entityPath, `type.gql`), 'utf8')
    schema.push(entityGQL)
  })
  return schema.join('\n')
})()

module.exports = schema
