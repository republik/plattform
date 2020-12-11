import { t } from '../../lib/withT'
import { GITHUB_ORG, REPO_PREFIX } from '../../lib/settings'

export const getLabel = repo => {
  const {
    latestCommit: {
      document: { meta }
    }
  } = repo
  return (
    (meta.series && meta.series.title) ||
    (meta.section && meta.section.meta && meta.section.meta.title) ||
    (meta.format && meta.format.meta && meta.format.meta.title) ||
    (meta.dossier && meta.dossier.meta && meta.dossier.meta.title) ||
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
