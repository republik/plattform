import { gql } from '../gql'

export const PERSON_DETAIL_QUERY = gql(`
 query PersonDetail($slug: String!) {
    hub: challengeAcceptedHub {
      id
      logo {
        url
      }
    }
    person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {
      id
      name
      slug
      portrait {
        alt
        url
        width
        height
        title
      }
      catchPhrase
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
        repoId
        path
        image {
          url
          width
          height
        }
      }
      ... on ChallengeAcceptedNewsletterRecord {
        id
        repoId
        path
      }
    }
    }
  }
`)
