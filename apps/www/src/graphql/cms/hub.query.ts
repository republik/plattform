import { gql } from '../gql'

export const CHALLENGE_ACCEPTED_HUB_QUERY = gql(`
query ChallengeAcceptedHubQuery {
  hub: challengeAcceptedHub {
    id
    introduction {
      value
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
        path
      }
      ... on NewsletterRecord {
        id
        repoid
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
