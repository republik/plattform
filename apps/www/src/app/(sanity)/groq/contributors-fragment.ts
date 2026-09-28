// Projects an article's contributor entries onto the referenced contributor
export const CONTRIBUTORS_FRAGMENT = /* groq */ `
  contributors[]{
    "_id": contributor->_id,
    "name": contributor->title,
    kind
  }
`
