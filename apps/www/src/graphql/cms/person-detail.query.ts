import { gql } from '../gql'

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
      bio {
        value
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
        nonMemberCta {
          value
        }
        fullyBooked
        signUpLink
        location
        startAt
        endAt
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
