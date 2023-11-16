import { gql } from '../gql'

export const EVENTS_QUERY = gql(`
  query EventsQuery {
    events: allEvents {
      id
      slug
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
  }
`)

export const EVENT_QUERY = gql(`
  query EventQuery($slug: String) {
    event(filter: { slug: { eq: $slug }}) {
      id
      slug
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
  }
`)
