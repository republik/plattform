const GitHub = require('github-api')

module.exports = async (_, args, {pgdb, req}) => {
  if (!req.user) {
    throw new Error('you need to signIn first')
  }
  if (!req.user.githubAccessToken) {
    throw new Error('you need to sign in to github first')
  }

  const {
    organization,
    repo,
    branch: _branch,
    path,
    commitOid,
    content,
    message
  } = args

  const gh = new GitHub({
    token: req.user.githubAccessToken
  })

  const ghRepo = await gh
    .getRepo(organization, repo)

  let ghBranch
  try {
    ghBranch = (await ghRepo
      .getBranch(_branch)).data
  } catch (e) {}

  let branch
  if (ghBranch && ghBranch.commit.sha === commitOid) {
    branch = _branch
  } else { // auto-branching
    console.log('auto-branching!')
    branch = Math.random().toString(36).substring(7)
    await ghRepo.createRef({
      ref: 'refs/heads/' + branch,
      sha: commitOid
    })
    // console.log(refResult.data)
  }

  const result = await ghRepo
    .writeFile(
      branch,
      path,
      content,
      message,
      {}
    ).catch((e) => {
      throw new Error(e.response.data.message.toString())
    })
    // TODO proper error handling

  // https://developer.github.com/v3/repos/contents/#update-a-file
  return result.data.commit
}
