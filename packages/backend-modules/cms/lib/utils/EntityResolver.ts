import * as fs from 'node:fs'
import * as path from 'node:path'

export function loadEntities() {
  // load folder relative to this files location
  const entities = path.resolve(__dirname, '../entities')
  console.log(entities)
  return fs.readdirSync(entities)
}

export function getEntityPath(entity: string) {
  return path.join(path.resolve(__dirname, '../entities'), entity)
}

export function loadEntityGQL(entity: string) {
  const entityGQL = fs.readFileSync(
    path.join(getEntityPath(entity) + `type.gql`),
    'utf8',
  )
  return entityGQL
}
