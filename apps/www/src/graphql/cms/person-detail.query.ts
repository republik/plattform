import { gql } from '../gql'

export const PERSON_DETAIL_QUERY = gql(`
 query PersonDetail($slug: String!) {
    person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {
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
      ... on ChallengeAcceptedArticleRecord {
        id
        path
        image {
          url
          width
          height
        }
      }
      ... on ChallengeAcceptedNewsletterRecord {
        id
        path
      }
    }
    }
  }
`)
