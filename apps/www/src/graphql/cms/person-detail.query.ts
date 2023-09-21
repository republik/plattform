import { gql } from '../gql'

export const PERSON_DETAIL_QUERY = gql(`
  query PersonDetail($slug: String!) {
    person(filter: {slug: {eq: $slug}}) {
      id
      name
      age
      portrait {
        alt
        url
        width
        height
        title
      }
      items {
        __typename
        ... on EventRecord {
          id
          title
          description {
            value
          }
          location
          startAt
        }
        ... on ArticleRecord {
          id
          repoid
        }
        ... on NewsletterRecord {
          id
          repoid
        }
      }
    }
  }
`)
