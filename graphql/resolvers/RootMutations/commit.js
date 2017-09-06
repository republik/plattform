const GitHub = require('github-api')
const github = require('../../../lib/github')
const { hashObject } = require('../../../lib/git')
const visit = require('unist-util-visit')
const dataUriToBuffer = require('data-uri-to-buffer')
const MDAST = require('../../../lib/mdast/mdast')
const { ensureUserHasRole } = require('../../../lib/Roles')

module.exports = async (_, args, {pgdb, req, user}) => {
  ensureUserHasRole(user, 'editor')

  if (!req.user.githubAccessToken) {
    throw new Error('you need to sign in to github first')
  }

  const {
    repoId,
    parentId,
    message,
    document: {
      content: mdastString
    }
  } = args

  // connect
  const _github = new GitHub({
    token: req.user.githubAccessToken
  })
  const [login, repoName] = repoId.split('/')
  const repo = await _github.getRepo(login, repoName)

  // extract images
  const images = []
  const extractImage = url => {
    if (url) {
      let blob
      try {
        blob = dataUriToBuffer(url)
      } catch (e) {
        console.log('ignoring image node with url:' + url)
      }
      if (blob) {
        const suffix = blob.type.split('/')[1]
        const hash = hashObject(blob)
        const image = {
          path: `images/${hash}.${suffix}`,
          hash,
          blob
        }
        images.push(image)
        return image.path
      }
    }
    return url
  }
  const mdast = JSON.parse(mdastString)
  visit(mdast, 'image', node => {
    node.url = extractImage(node.url)
  })
  Object.keys(mdast.meta).forEach(key => {
    if (key.match(/image/i)) {
      mdast.meta[key] = extractImage(mdast.meta[key])
    }
  })

  // serialize
  const markdown = MDAST.stringify(mdast)

  // markdown -> blob
  const markdownBlob = await repo
    .createBlob(markdown)
    .then(result => result.data)

  // images -> blobs
  await Promise.all(images.map(({ blob }) => {
    return repo
      .createBlob(blob)
      .then(result => result.data)
  }))

  // load base_tree
  const parentCommit = await repo
    .getCommit(parentId)
    .then(result => result.data)

  const tree = await repo
    .createTree(
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
    ],
      parentCommit.tree.sha
    )
    .then(result => result.data)

  const commit = await github.commit(
    req.user.githubAccessToken,
    repoId,
    [parentId],
    tree.sha,
    message
  )

  // load heads
  const heads = await github.heads(req.user, repoId)

  // check if parent is (still) a head
  const headParent = heads.find(ref =>
    ref.target.oid === parentId
  )

  let branch
  if (headParent) { // fast-forward
    await repo.updateHead(
      'heads/' + headParent.name,
      commit.sha,
      false
    )
    branch = headParent.name
  } else {
    // TODO simpler branch name
    branch = Math.random().toString(36).substring(7)
    await repo.createRef({
      ref: `refs/heads/${branch}`,
      sha: commit.sha
    })
  }

  return {
    id: commit.sha,
    parentIds: commit.parents
      ? commit.parents.map(parent => parent.sha)
      : [],
    message: commit.message,
    author: commit.author,
    date: new Date(commit.author.date),
    repo: { // commit resolver
      id: repoId
    }
  }
}
