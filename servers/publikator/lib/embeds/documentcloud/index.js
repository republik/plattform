const fetch = require('isomorphic-unfetch')

const getDocumentCloudDocById = async (id, t) => {
  const response = await fetch(
    `https://www.documentcloud.org/api/documents/${id}.json`,
    {
      method: 'GET',
      headers: {
        'Accept-Encoding': 'gzip'
      }
    }
  )
    .then(res => res.json())
    .catch(error => {
      console.error(`Error getting documentcloud doc with id ${id}:`, error)
      return error
    })

  if (response.errors) {
    throw new Error(
      response.errors.reduce(
        (error, { code, message }) => error.concat(` ${code}: ${message}`),
        'DocumentCloud API Errors:'
      )
    )
  }

  const doc = response.document

  // the thumbnail is mission critical, if it fails it break and alert us to fix it (we even have test coverage now)
  const thumbnail = doc.resources.page.image
    .replace('{page}', '1').replace('{size}', 'normal')

  return {
    id,
    title: doc.title,
    thumbnail: thumbnail,
    createdAt: new Date(doc.created_at),
    updatedAt: new Date(doc.updated_at),
    retrievedAt: new Date(),
    contributorUrl: doc.contributor_documents_url,
    contributorName: doc.contributor,
    url: doc.canonical_url
  }
}

module.exports = {
  getDocumentCloudDocById,
  // manually keep in sync with backend-modules/packages/documents/lib/process.js
  // until embeds are in their own module
  imageKeys: ['thumbnail']
}
