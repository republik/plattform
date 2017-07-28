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
    branch,
    path,
    content,
    message
  } = args

  const gh = new GitHub({
    token: req.user.githubAccessToken
  })
  const ghRepo = gh
    .getRepo(organization, repo)

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
