import { GITHUB_ORG, REPO_PREFIX, TEMPLATE_PREFIX } from '../settings'
import { t } from '../withT'

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

  const isPlayground = meta.title?.match(/(^Spielplatz|Spielplatz$)/gi)

  return (
    (isPlayground && `${meta.title} 🎈`) ||
    meta.title ||
    id.replace([GITHUB_ORG, REPO_PREFIX || ''].join('/'), '')
  )
}

export const isPrepublished = publication =>
  publication.document && publication.prepublication

export const isPublished = publication =>
  publication.document && !publication.prepublication && publication.live

export const getTemplateRepoPrefix = templateId =>
  templateId.split('/')[1].replace(TEMPLATE_PREFIX, '')

export const containsRepoFromTemplate = (repos, templateRepoId) =>
  !!repos.find(repo =>
    repo.id.split('/')[1].startsWith(getTemplateRepoPrefix(templateRepoId))
  )
