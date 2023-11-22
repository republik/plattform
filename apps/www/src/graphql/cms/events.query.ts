import { gql } from '../gql'

export const EventFragment = gql(`
  fragment Event on EventRecord {
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
`)

export const EVENTS_QUERY = gql(`
  query EventsQuery($today: DateTime!) {
    events: allEvents(filter: {OR: [{startAt: {gte: $today}}, {endAt: {gte: $today}}]}) {
      ...Event
    }
    pastEvents: allEvents(filter: {AND: [{startAt: {lt: $today}}, {endAt: {lt: $today}}]}) {
      ...Event
    }
  }
`)

export const EVENT_QUERY = gql(`
  query EventQuery($slug: String) {
    event(filter: { slug: { eq: $slug }}) {
      ...Event
    }
  }
`)
