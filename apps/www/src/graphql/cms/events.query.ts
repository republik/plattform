import { gql } from '../gql'

export const EVENTS_QUERY = gql(`
  query EventsQuery {
    events: allEvents {
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
  }
`)

export const EVENT_QUERY = gql(`
  query EventQuery($slug: String) {
    event(filter: { slug: { eq: $slug }}) {
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
  }
`)
