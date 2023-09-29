import { gql } from './gql'

export const PERSON_DETAIL_QUERY = gql(`
  query PersonDetail($slug: String!) {
    person(filter: {slug: {eq: $slug}}) {
      id
      name
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
        isPublic
        description {
          value
        }
        nonMemberCta
        location
        startAt
        endAt
        signUpLink
      }
      ... on ArticleRecord {
        id
        path
        image {
          url
        }
      }
      ... on NewsletterRecord {
        id
        path
      }
    }
    }
  }
`)
