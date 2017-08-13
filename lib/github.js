const fetch = require('isomorphic-unfetch')

module.exports = {
  async commit (token, owner, repo, parents, tree, message) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message,
        tree,
        parents
      })
    })

    return response.json()
  }
}
