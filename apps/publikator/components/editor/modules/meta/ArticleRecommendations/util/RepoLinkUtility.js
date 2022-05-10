const GITHUB_PREFIX = 'https://github.com/'

export function getAbsoluteRepoUrl(repoId) {
  if (repoId && !repoId.startsWith(GITHUB_PREFIX)) {
    return GITHUB_PREFIX + repoId
  }
  return repoId
}

export function getRelativeRepoUrl(repoId) {
  return repoId?.replace(GITHUB_PREFIX, '')
}
