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
  people: allPeople {
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
