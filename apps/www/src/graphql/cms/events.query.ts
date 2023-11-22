import { gql } from '../gql'

export const EventRecordFields = gql(`
  fragment EventRecordFields on EventRecord {
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
      ...EventRecordFields
    }
    pastEvents: allEvents(filter: {AND: [{startAt: {lt: $today}}, {endAt: {lt: $today}}]}) {
      ...EventRecordFields
    }
  }
`)

export const EVENT_QUERY = gql(`
  query EventQuery($slug: String) {
    event(filter: { slug: { eq: $slug }}) {
      ...EventRecordFields
    }
  }
`)
