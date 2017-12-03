const { hashObject } = require('../../../lib/git')
const visit = require('unist-util-visit')
const dataUriToBuffer = require('data-uri-to-buffer')
const MDAST = require('../../../lib/mdast/mdast')
const { unprefixUrl } = require('../../../lib/assets')
const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const superb = require('superb')
const superheroes = require('superheroes')
const sleep = require('await-sleep')
const sharp = require('sharp')
const {
  createGithubClients,
  commitNormalizer,
  getRepo,
  getHeads
} = require('../../../lib/github')

const extractImage = async (url, images) => {
  if (url) {
    let blob
    try {
      blob = dataUriToBuffer(url)
    } catch (e) { /* console.log('ignoring image node with url:' + url) */ }
    if (blob) {
      const meta = await sharp(blob).metadata()
      const suffix = blob.type.split('/')[1]
      const hash = hashObject(blob)
      const path = `images/${hash}.${suffix}`
      const url = `${path}?size=${meta.width}x${meta.height}`
      const image = {
        path,
        hash,
        blob
      }
      images.push(image)
      return url
    }
  }
  return url
}

module.exports = async (_, args, { pgdb, req, user, t, pubsub }) => {
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()

  const {
    repoId,
    parentId,
    message,
    document: {
      content: mdast
    }
  } = args

  const [login, repoName] = repoId.split('/')

  // get / create repo
  let repo = await getRepo(repoId)
    .catch(response => null)

  if (repo) {
    if (!parentId) {
      throw new Error(t('api/commit/parentId/required', { repoId }))
    }
  } else {
    if (parentId) {
      throw new Error(t('api/commit/parentId/notAllowed', { repoId }))
    }
    repo = await githubRest.repos.createForOrg({
      org: login,
      name: repoName,
      private: true,
      auto_init: true
    })

    let ready = false
    let count = 20
    while (ready === false) {
      const heads = await getHeads(repoId)
      if (heads.length > 0 && heads[0] && heads[0].target && heads[0].target.oid.length > 0) {
        ready = true
      } else {
        if (count-- < 0) {
          throw new Error('commit could not create a repo in time. please try again.')
        }
        await sleep(300)
      }
    }
  }

  // reverse asset url prefixing
  visit(mdast, 'image', node => {
    node.url = unprefixUrl(node.url)
  })
  if (mdast.meta) {
    Object.keys(mdast.meta).forEach(key => {
      if (key.match(/image/i)) {
        mdast.meta[key] = unprefixUrl(mdast.meta[key])
      }
    })
  }

  // extract images
  const images = []
  const promises = []
  visit(mdast, 'image', async (node) => {
    promises.push((async () => {
      node.url = await extractImage(node.url, images)
    })())
  })
  if (mdast.meta) {
    promises.push(...Object.keys(mdast.meta).map(async (key) => {
      if (key.match(/image/i)) {
        mdast.meta[key] = await extractImage(mdast.meta[key], images)
      }
    }))
  }
  await Promise.all(promises)

  // serialize
  const markdown = MDAST.stringify(mdast)

  // markdown -> blob
  const markdownBlob = await githubRest.gitdata.createBlob({
    owner: login,
    repo: repoName,
    content: markdown,
    encoding: 'utf-8'
  })
    .then(result => result.data)

  // images -> blobs
  await Promise.all(images.map(({ blob }) => {
    return githubRest.gitdata.createBlob({
      owner: login,
      repo: repoName,
      content: blob.toString('base64'),
      encoding: 'base64'
    })
      .then(result => result.data)
  }))

  let parentCommit
  if (parentId) { // otherwise initial commit
    // load base_tree
    parentCommit = await githubRest.gitdata.getCommit({
      owner: login,
      repo: repoName,
      sha: parentId
    })
      .then(result => result.data)
  }

  const tree = await githubRest.gitdata.createTree({
    owner: login,
    repo: repoName,
    ...(parentCommit ? { base_tree: parentCommit.tree.sha } : {}),
    tree:
    [
      ...images.map(({ path, hash }) => ({
        path,
        sha: hash,
        mode: '100644', // blob (file)
        type: 'blob'
      })),
      {
        path: 'article.md',
        sha: markdownBlob.sha,
        mode: '100644',
        type: 'blob'
      }
    ]
  })
    .then(result => result.data)

  const commit = await githubRest.gitdata.createCommit({
    owner: login,
    repo: repoName,
    message,
    tree: tree.sha,
    parents: parentId ? [parentId] : [],
    author: user.gitAuthor()
  })
    .then(result => result.data)

  // load heads
  const heads = await getHeads(repoId)

  // check if parent is (still) a head
  // pick master for new repos initated by github
  const headParent = parentId
    ? heads.find(ref =>
        ref.target.oid === parentId
      )
    : { name: 'master' }

  let branch
  if (headParent) { // fast-forward
    branch = headParent.name
    await githubRest.gitdata.updateReference({
      owner: login,
      repo: repoName,
      ref: 'heads/' + headParent.name,
      sha: commit.sha,
      force: !parentId
    })
  } else {
    branch = `${superb()}-${superheroes.random().toLowerCase()}`
      .replace(/\s/g, '-')
    await githubRest.gitdata.createReference({
      owner: login,
      repo: repoName,
      ref: `refs/heads/${branch}`,
      sha: commit.sha
    })
  }

  // latest commit -> default branch
  githubRest.repos.edit({
    owner: login,
    repo: repoName,
    name: repoName,
    default_branch: branch
  })
    .catch(e =>
      console.error('edit default_branch failed!', e)
    )

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  return commitNormalizer({
    // normalize createCommit format to getCommit (duh gh!)
    sha: commit.sha,
    commit,
    parents: commit.parents,
    //
    repo: {
      id: repoId
    }
  })
}
