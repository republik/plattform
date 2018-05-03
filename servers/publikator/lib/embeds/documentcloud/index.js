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

  const document = response.document

  // find the thumbnail, but do not fail if we can't find it
  let thumbnail
  try {
    thumbnail = document.resources.page.image.replace('{page}', '1').replace('{size}', 'normal')
  } catch (e) {
    // we can't find a thumbnail, but this is not critical, so just move on
  }

  return {
    id: id,
    title: document.title,
    thumbnail: thumbnail,
    createdAt: new Date(document.created_at),
    updatedAt: new Date(document.updated_at),
    retrievedAt: new Date(),
    contributorUrl: document.contributor_documents_url,
    contributorName: document.contributor
  }
}

module.exports = {
  getDocumentCloudDocById,
  // manually keep in sync with backend-modules/packages/documents/lib/process.js
  // until embeds are in their own module
  imageKeys: ['thumbnail']
}
