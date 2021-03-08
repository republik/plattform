#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()
const Promise = require('bluebird')
const debug = require('debug')('import')
const git = require('nodegit')
const path = require('path')
const fs = require('fs').promises
const { ascending, descending } = require('d3-array')
const uniqWith = require('lodash/uniqWith')

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const {
  parse: mdastParse,
  stringify: mdastStringify,
} = require('@orbiting/remark-preset')
const {
  lib: {
    Repo: { isImageUploaded, uploadImage },
  },
} = require('@orbiting/backend-modules-assets')

const phases = require('../../lib/phases')

const { GITHUB_LOGIN, GITHUB_LOGIN_DESTINATION = GITHUB_LOGIN } = process.env

const filesExclude = false // []
const filesInclude = false // []
const orgPath = `/usr/local/var/code/${GITHUB_LOGIN}`
const skipFetch = true
const skipArchived = false
const skipImages = false
const skipCommits = false
const slice = [0, 50] // [4000, 6000]

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

function createHandleRepo(context) {
  const { pgdb } = context
  return async function handleRepo(repoFolder, index, length) {
    const tx = await pgdb.transactionBegin()

    try {
      const { gitRepo, gitCommits, gitTags } = await compileRepo(repoFolder)

      const localRepo = await upsertLocalRepo(repoFolder, gitCommits, tx)
      console.log(index, length, localRepo.id)

      await upsertImages(localRepo, gitRepo)
      const localCommits = await upsertLocalCommits(localRepo, gitCommits, tx)
      const milestones = await upsertMilestones(
        localRepo,
        localCommits,
        gitTags,
        tx,
      )
      await upsertCurrentPhase(localRepo, milestones, tx)

      await tx.transactionCommit()
    } catch (e) {
      console.error(`handleRepo error on ${repoFolder.name}:`, e)
      console.log(JSON.stringify(e))
      await tx.transactionRollback()
    }
  }
}

async function upsertCurrentPhase(localRepo, milestones, tx) {
  const { key: currentPhase } = phases.getCurrentPhase(localRepo, milestones)

  await tx.publikator.repos.updateOne({ id: localRepo.id }, { currentPhase })
}

async function getCommitImageRefs(gitCommit) {
  const tree = await gitCommit.getTree()

  return new Promise((resolve, reject) => {
    const eventEmitter = tree.walk()
    eventEmitter.on('end', (entries) => {
      resolve(
        entries
          .filter((e) => e.path().match(/^images\//))
          .map((entry) => ({ path: entry.path(), commit: gitCommit })),
      )
    })
    eventEmitter.start()
  })
}

async function upsertImages(localRepo, gitRepo) {
  if (skipImages) {
    debug('upsertImages %s skipped', localRepo.id)
    return
  }

  debug('upsertImages %s', localRepo.id)

  const references = await gitRepo.getReferences()
  const remoteRefs = references.filter((r) =>
    r.name().match(/^refs\/remotes\/origin\//),
  )

  const allImageReferences = await Promise.mapSeries(
    remoteRefs,
    async (remoteRef) =>
      getCommitImageRefs(await gitRepo.getReferenceCommit(remoteRef)),
  )

  const imageReferences = uniqWith(
    allImageReferences.flat(),
    (a, b) => a.path === b.path,
  )

  await Promise.map(
    imageReferences,
    async (imageReference) => {
      const { path, commit } = imageReference
      if (await isImageUploaded(localRepo.id, { path })) {
        debug(
          'upsertImages[].images %s uploaded already %s',
          localRepo.id,
          path,
        )
        return
      }

      const gitEntry = await commit.getEntry(path)
      const gitBlob = await gitEntry.getBlob()
      const blob = gitBlob.content()

      debug('upsertImages[].images %s upload %s', localRepo.id, path)
      await uploadImage(localRepo.id, { path, blob })
    },
    { concurrency: 10 },
  )
}

async function upsertMilestones(localRepo, localCommits, gitTags, tx) {
  const { id: repoId, updatedAt: repoUpdatedAt } = localRepo
  debug('upsertMilestones on %s (%i milestones)', repoId, gitTags.length)

  const gitPublicationAliases = []

  const milestones = await Promise.map(gitTags, async (gitTag) => {
    const { name, meta, object, commit } = gitTag
    if (['publication', 'prepublication'].includes(name)) {
      gitPublicationAliases.push(gitTag)
    } else if (
      ['scheduled-publication', 'scheduled-prepublication'].includes(name)
    ) {
      // noop
    } else if (name === 'meta') {
      const localRepo = await tx.publikator.repos.findOne({ id: repoId })
      await tx.publikator.repos.update(
        { id: repoId },
        { meta: { ...localRepo.meta, ...meta } },
      )
    } else {
      const milestone = await tx.publikator.milestones.findOne({
        name,
        commitId: localCommits.map((c) => c.id),
      })

      const isPublication = !!name.match(/^v\d+/)
      if (isPublication && milestone) {
        return milestone
      }

      const { id: commitId, repoId } = localCommits.find(
        (c) => c.hash === commit.sha(),
      )
      if (!commitId) {
        throw new Error('publication points to non-existant commit sha')
      }

      const isPrepublication = !!name.match(/prepublication/)
      const createdAt = new Date(object.tagger().when().time() * 1000)
      const { scheduledAt, ...metaRest } = meta

      const author = {
        name: object.tagger().name(),
        email: object.tagger().email(),
      }
      const userId =
        (
          await tx.public.users.findOne(
            { email: author.email },
            { fields: ['id'] },
          )
        )?.id || null

      const data = {
        repoId,
        commitId,
        scope:
          (isPublication &&
            ((isPrepublication && 'prepublication') || 'publication')) ||
          'milestone',
        name,
        meta: metaRest,
        userId,
        author,
        createdAt,
        scheduledAt: null,
        publishedAt: null,
        revokedAt: null,
      }

      if (milestone) {
        return tx.publikator.milestones.updateAndGetOne(
          { id: milestone.id },
          data,
        )
      }

      return tx.publikator.milestones.insertAndGet(data)
    }

    return false
  }).filter(Boolean)

  if (!milestones.length) {
    return []
  }

  // publications

  debug('upsertMilestones on %s (%i publications)', repoId, milestones.length)
  const publishedMilestoneNames = []
  const now = new Date()

  for (const gitTag of gitTags.filter((t) => !!t.name.match(/^v\d+/))) {
    const { name, meta, object } = gitTag
    debug('upsertMilestones[].milestone %s %s', localRepo.id, name)

    const scheduledAt =
      meta.scheduledAt || new Date(object.tagger().when().time() * 1000)
    const inFuture = scheduledAt > now
    const publishedAt = (!inFuture && scheduledAt) || null

    const milestone = milestones.find((m) => m.name === name)

    await tx.publikator.milestones.update(
      { id: milestone.id },
      { scheduledAt, publishedAt, revokedAt: null },
    )

    publishedMilestoneNames.length &&
      (await tx.publikator.milestones.update(
        {
          repoId: milestone.repoId,
          'id !=': milestone.id,
          name: publishedMilestoneNames,
          scope: [
            'prepublication',
            milestone.scope === 'publication' && 'publication',
          ].filter(Boolean),
          ...(inFuture && { publishedAt: null }),
          revokedAt: null,
        },
        { revokedAt: milestone.createdAt },
      ))

    publishedMilestoneNames.push(name)
  }

  const gitPublicationTags = Array.from(
    new Set(gitPublicationAliases?.map((tag) => tag.object.name())),
  )

  if (publishedMilestoneNames.length && !gitPublicationTags.length) {
    debug('upsertMilestones %s seems unpublished', localRepo.id)
    await tx.publikator.milestones.update(
      {
        repoId,
        scope: ['publication', 'prepublication'],
        // 'publishedAt !=': null, // ignore scheduled at ones
        revokedAt: null,
      },
      { revokedAt: repoUpdatedAt },
    )
  }

  return tx.publikator.milestones.find({ repoId })
}

async function upsertLocalRepo(repoFolder, gitCommits, tx) {
  const { id, meta } = repoFolder

  debug('upsertLocalRepo %s', repoFolder.id)
  const localRepo = await tx.publikator.repos.findOne({ id })

  const createdAt = new Date(
    gitCommits.reduce(
      (date, commit) => Math.min(date, commit.date()),
      new Date(),
    ),
  )
  const updatedAt = new Date(
    gitCommits.reduce((date, commit) => Math.max(date, commit.date()), 0),
  )

  if (!localRepo) {
    return tx.publikator.repos.insertAndGet({
      id,
      createdAt,
      updatedAt,
      meta: {
        ...(meta?.isTemplate && { isTemplate: true }),
      },
      ...(meta?.isArchived && { archivedAt: meta.updatedAt }),
    })
  } else {
    return tx.publikator.repos.updateAndGetOne(
      { id: localRepo.id },
      {
        updatedAt,
        meta: {
          ...localRepo.meta,
          ...(meta?.isTemplate && { isTemplate: true }),
        },
        ...(meta?.isArchived && { archivedAt: meta.updatedAt }),
      },
    )
  }
}

async function upsertLocalCommits(localRepo, gitCommits, tx) {
  if (skipCommits) {
    debug('upsertLocalCommits %s skipped', localRepo.id)
    return tx.publikator.commits.find(
      { repoId: localRepo.id },
      {
        fields: [
          'id',
          'hash',
          'repoId',
          'parentHashes',
          'meta',
          'author',
          'createdAt',
          'parentIds',
        ],
      },
    )
  }

  debug('upsertLocalCommits %s', localRepo.id)
  const localCommits = await Promise.mapSeries(
    gitCommits,
    async (gitCommit, index, length) => {
      const hash = gitCommit.sha()
      debug(
        'upsertLocalCommits[].commit %s %s (%i/%i)',
        localRepo.id,
        hash,
        index + 1,
        length,
      )

      const localCommit = await tx.publikator.commits.findOne(
        {
          repoId: localRepo.id,
          hash,
        },
        {
          fields: [
            'id',
            'hash',
            'repoId',
            'parentHashes',
            'meta',
            'author',
            'createdAt',
            'parentIds',
          ],
        },
      )
      if (localCommit) {
        return localCommit
      }

      const author = {
        name: gitCommit.author().name(),
        email: gitCommit.author().email(),
      }
      const userId =
        (
          await tx.public.users.findOne(
            { email: author.email },
            { fields: ['id'] },
          )
        )?.id || null

      const { content, meta } = await getArticle(gitCommit)
      const commit = {
        repoId: localRepo.id,
        hash,
        parentHashes: gitCommit.parents().map((oid) => oid.tostrS()),
        message: gitCommit.message(),
        userId,
        author: {
          name: gitCommit.author().name(),
          email: gitCommit.author().email(),
        },
        createdAt: gitCommit.date(),
        content,
        meta,
      }

      return await tx.publikator.commits.insertAndGet(commit, {
        return: [
          'id',
          'hash',
          'repoId',
          'parentHashes',
          'meta',
          'author',
          'createdAt',
          'parentIds',
        ],
      })
    },
  )

  debug('upsertLocalCommits parenting %s', localRepo.id)
  await Promise.each(localCommits, async (localCommit) => {
    const { id, parentIds, parentHashes } = localCommit
    if (!parentIds?.length && parentHashes?.length > 0) {
      debug(
        'upsertLocalCommits[].commit parenting %s %s',
        localRepo.id,
        localCommit.id,
      )
      const parentIds = localCommits
        .filter((c) => parentHashes.includes(c.hash))
        .map((c) => c.id)
      await tx.publikator.commits.updateOne({ id }, { parentIds })
    }
  })

  return tx.publikator.commits.find(
    { repoId: localRepo.id },
    {
      fields: [
        'id',
        'hash',
        'repoId',
        'parentHashes',
        'meta',
        'author',
        'createdAt',
        'parentIds',
      ],
    },
  )
}

async function compileRepo({ path }) {
  const gitRepo = await getRepo(path)

  const { gitCommits, gitTags } = await Promise.props({
    gitCommits: getCommits(gitRepo),
    gitTags: getTags(gitRepo),
  })

  return { gitRepo, gitCommits, gitTags }
}

async function getArticle(commit) {
  try {
    const entry = await commit.getEntry('article.md')
    const article = String(await entry.getBlob())

    const mdast = mdastParse(article)
    const { meta } = mdast
    mdast.meta = {}

    // eslint-disable-next-line no-control-regex
    const content = mdastStringify(mdast).replace(/\x00/g, '')

    return { content, meta }
  } catch (e) {
    debug('unable to get article', e.toString(), { commit: commit.sha() })

    return { content: null, meta: { importError: e.toString() } }
  }
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

async function getCommits(repo) {
  const revwalk = await git.Revwalk.create(repo)
  revwalk.pushGlob('refs/remotes/origin/*')

  return revwalk.getCommitsUntil(() => true)
}

async function getTags(repo) {
  const tags = await Promise.mapSeries(
    await git.Tag.list(repo),
    async (name) => {
      const object = await repo.getTagByName(name)
      const time = object.tagger().when().time()
      const meta = await getTagMeta(object)
      const targetRef = await object.peel()
      const commit = await repo.getCommit(targetRef)

      return { name, time, meta, object, commit }
    },
  )

  return tags.sort((a, b) => ascending(a.time, b.time))
}

async function getTagMeta(gitTag) {
  try {
    const mdast = mdastParse(gitTag.message())
    const { meta } = mdast

    return meta
  } catch (e) {
    debug('unable to get tag meta', e.toString(), { tag: gitTag.name() })

    return { importError: e.toString() }
  }
}

async function toRepoFolder(fileName) {
  const filePath = path.join(orgPath, fileName)
  const fileStats = await fs.stat(filePath)

  const repo = {
    id: `${GITHUB_LOGIN_DESTINATION}/${fileName}`,
    name: fileName,
    path: filePath,
    stats: fileStats,
  }

  const metaFilePath = path.join(filePath, '.github.meta.json')
  try {
    const unparsedMeta = await fs.readFile(metaFilePath, 'utf-8')
    const meta = JSON.parse(unparsedMeta)
    Object.assign(repo, { meta })
  } catch (e) {
    debug('missing', metaFilePath)
  }

  return repo
}

function filterFolders({ name, stats, meta }) {
  if (!stats.isDirectory()) {
    return false
  }

  if (filesExclude && filesExclude.includes(name)) {
    return false
  }

  if (filesInclude) {
    return filesInclude.includes(name)
  }

  if (skipArchived && meta.isArchived) {
    debug('skip %s because archived', name)
    return false
  }

  return true
}

function sortByModifiedTime(a, b) {
  return descending(a.stats.mtime, b.stats.mtime)
}

ConnectionContext.create()
  .then(async (context) => {
    const handleRepo = createHandleRepo(context)

    const repoFolders = (
      await Promise.map(await fs.readdir(orgPath), toRepoFolder)
    )
      .filter(filterFolders)
      .sort(sortByModifiedTime)

    const [start = 0, end = repoFolders.length] = slice

    /* await Promise.map(
      repoFolders.slice(start, end),
      handleRepo,
      { concurrency: 10 }
    ) */
    await Promise.mapSeries(repoFolders.slice(start, end), handleRepo)

    return context
  })
  .then((context) => ConnectionContext.close(context))
  .then(() => process.exit(0))
