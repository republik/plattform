import { gql } from '../gql/cms'

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
    _updatedAt
  }
`)

export const EVENTS_QUERY = gql(`
  query EventsQuery($today: DateTime!) {
    events: allEvents(filter: {OR: [{startAt: {gte: $today}}, {endAt: {gte: $today}}]}, orderBy: startAt_DESC) {
      ...EventRecordFields
    }
    pastEvents: allEvents(filter: {AND: [{startAt: {lt: $today}}, {endAt: {lt: $today}}]}, orderBy: startAt_DESC) {
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

export const EVENT_META_QUERY = gql(`
query EventMetaQuery($slug: String) {
  event(filter: { slug: { eq: $slug }}) {
    id
    title
    seo {
      title
      description
      image {
        url(imgixParams: {w: "1500"})
      }
    }
  }
}
`)
