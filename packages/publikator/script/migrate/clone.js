#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()
const Promise = require('bluebird')
const debug = require('debug')('clone')
const git = require('nodegit')
const path = require('path')
const fs = require('fs').promises

const { getRepos } = require('../../lib/github')

const { GITHUB_LOGIN } = process.env

const orgPath = `/usr/local/var/code/${GITHUB_LOGIN}`
const reposMaxPage = 5
const startAfter = false
const skipFetch = false

async function iterateRepos(repoHandler) {
  debug('iterateRepos')

  let info = startAfter && { hasNextPage: true, endCursor: startAfter }
  let counter = 1

  do {
    const { pageInfo, repositories } = await getRepos({
      first: 10,
      orderBy: { field: 'PUSHED_AT', direction: 'DESC' },
      ...(info?.hasNextPage ? { after: info.endCursor } : {}),
    })

    info = pageInfo

    debug('page %i (after: %s)', counter++, info?.endCursor)

    await Promise.map(repositories, repoHandler)
  } while (
    info?.hasNextPage &&
    (!reposMaxPage || counter <= reposMaxPage) // eslint-disable-line no-unmodified-loop-condition
  )
}

const cloneOptions = {
  fetchOpts: {
    downloadTags: git.Remote.AUTOTAG_OPTION.DOWNLOAD_TAGS_ALL,
    callbacks: {
      certificateCheck: function () {
        return 0
      },
      credentials: function (url, userName) {
        return git.Cred.sshKeyFromAgent(userName)
      },
    },
  },
}

async function getRepo(localPath) {
  return git.Repository.open(localPath)
    .then(async (repo) => {
      if (!skipFetch) {
        debug('fetch repo in %s', localPath)
        await repo.fetchAll(cloneOptions.fetchOpts)
      }
      return repo
    })
    .catch(() => {})
}

async function fetchRepo(localPath) {
  return getRepo(localPath)
}

async function cloneRepo(cloneUrl, localPath) {
  debug('clone repo %s to %s ', cloneUrl, localPath)
  return git.Clone(cloneUrl, localPath, cloneOptions)
}

async function handleRepo(githubRepo) {
  const { name } = githubRepo
  const cloneUrl = `git@github.com:${GITHUB_LOGIN}/${name}.git`
  const localPath = path.join(orgPath, name)
  const metaPath = path.join(localPath, '.github.meta.json')

  try {
    const localRepo = await fetchRepo(localPath)

    if (!localRepo) {
      await cloneRepo(cloneUrl, localPath)
    }

    await fs.writeFile(
      metaPath,
      JSON.stringify(githubRepo),
      { flag: 'w+' },
      (e) => {
        if (e) {
          throw e
        }
      },
    )

    try {
      const now = new Date()
      await fs.utimes(localPath, now, new Date(githubRepo.updatedAt))
    } catch (e) {
      debug(e)
      throw new Error('touch failed')
    }

    debug('done in %s', localPath)
  } catch (e) {
    throw new Error('handleRepo failed:', e)
  }
}

async function run() {
  try {
    await iterateRepos(handleRepo)
  } catch (e) {
    console.error(e)
  }

  debug('done')
  process.exit(0)
}

run()
