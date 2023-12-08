import { gql } from './gql'

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
        slug
        description {
          value
        }
        membersOnly
        nonMemberCta {
          value
        }
        fullyBooked
        signUpLink
        location
        locationLink
        startAt
        endAt
        _updatedAt
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
