const GITHUB_PREFIX = 'https://github.com/'

export function createAbsolutRepoUrl(repoId) {
  if (repoId && !repoId.startsWith(GITHUB_PREFIX)) {
    return GITHUB_PREFIX + repoId
  }
  return repoId
}

export function createRelativeRepoUrl(repoId) {
  return repoId?.replace(GITHUB_PREFIX, '')
}
