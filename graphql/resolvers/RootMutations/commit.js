const GitHub = require('github-api')
const github = require('../../../lib/github')
const { hashObject } = require('../../../lib/git')
const visit = require('unist-util-visit')
const loremMdast = require('../../../lib/lorem.mdast.json')
const dataUriToBuffer = require('data-uri-to-buffer')

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
      content: _content
    }
  } = args

  // connect
  const _github = new GitHub({
    token: req.user.githubAccessToken
  })
  const [login, repoName] = repoId.split('/')
  const repo = await _github.getRepo(login, repoName)

  const content = loremMdast // example

  // extract images
  const images = []
  const extractImages = (node) => {
    if (node.url) {
      let blob
      try {
        blob = dataUriToBuffer(node.url)
      } catch (e) {
        console.log(node.url)
        throw e
      }
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
  visit(content, 'image', extractImages)
  console.log(content)

  // images -> blobs
  await Promise.all(images.map(({ blob }) => {
    return repo
      .createBlob(blob)
      .then(result => result.data)
  }))

  // content -> blob
  const contentBlob = await repo
    .createBlob(JSON.stringify(content))
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
        sha: contentBlob.sha,
        mode: '100644',
        type: 'blob'
      }
    ]
    )
    .then(result => result.data)
  console.log(tree)

  const commit = await github.commit(
    req.user.githubAccessToken,
    repoId,
    [parentId],
    tree.sha,
    message
  )

  // load heads
  const heads = await github.heads(req.user, repoId)
  console.log(heads)

  // check if parent is (still) a head
  const headParent = heads.find(ref =>
    ref.target.oid === parentId
  )
  console.log(headParent)

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
    id: 'asdf'// result.data.commit.sha,
    // ref: 'refs/heads/' + branch
  }
}
