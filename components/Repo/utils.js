import { t } from '../../lib/withT'
import { GITHUB_ORG, REPO_PREFIX } from '../../lib/settings'
import { swissTime } from '../../lib/utils/format'

const dateTimeFormat = '%d.%m %H:%M'
const formatDateTime = swissTime.format(dateTimeFormat)

export const getLabel = repo => {
  const {
    latestCommit: {
      document: { meta }
    }
  } = repo
  return (
    meta.series?.title ||
    meta.section?.meta.title ||
    meta.format?.meta.title ||
    meta.dossier?.meta.title ||
    (meta.template !== 'article' &&
      t(`repo/add/template/${meta.template}`, null, meta.template))
  )
}

export const getTitle = repo => {
  const {
    id,
    latestCommit: {
      document: { meta }
    }
  } = repo
  return meta.title || id.replace([GITHUB_ORG, REPO_PREFIX || ''].join('/'), '')
}

export const isPrepublished = publication =>
  publication.document && publication.prepublication

export const isPublished = publication =>
  publication.document && !publication.prepublication && publication.live

export const displayDateTime = string =>
  string && formatDateTime(new Date(string))
