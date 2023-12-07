import { gql } from './gql'

export const CHALLENGE_ACCEPTED_HUB_QUERY = gql(`
query ChallengeAcceptedHubQuery {
  hub: challengeAcceptedHub {
    id
    logo {
      url
    }
    introduction {
      value
    }
    outro {
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
  people: allChallengeAcceptedPeople(first: 50) {
    id
    slug
    name
    portrait {
      url
      height
      width
    }
  }
}
`)

export const CHALLENGE_ACCEPTED_HUB_META_QUERY = gql(`
query ChallengeAcceptedHubMetaQuery {
  hub: challengeAcceptedHub {
    id
    metadata {
      title
      description
      image {
        url(imgixParams: {w: "1500"})
      }
    }
  }
}
`)
