const GitHub = require('github-api')
const github = require('../../../lib/github')
const { hashObject } = require('../../../lib/git')
const visit = require('unist-util-visit')
const dataUriToBuffer = require('data-uri-to-buffer')
const MDAST = require('../../../lib/mdast/mdast')

module.exports = async (_, args, {pgdb, req, user}) => {
  if (!req.user) {
    throw new Error('you need to signIn first')
  }
  if (!req.user.githubAccessToken) {
    throw new Error('you need to sign in to github first')
  }

  const {
    repoId,
    parentId,
    message,
    document: {
      content: mdast
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
  const extractImages = (node) => {
    if (node.url) {
      let blob
      try {
        blob = dataUriToBuffer(node.url)
      } catch (e) {
        console.log('ignoring image node with url:' + node.url)
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
        node.url = image.path
      }
    }
  }
  visit(mdast, 'image', extractImages)

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
    ]
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

  // https://developer.github.com/v3/repos/contents/#update-a-file
  return {
    id: commit.sha
  }
}
