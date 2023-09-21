import { gql } from '../gql'

export const PERSON_DETAIL_QUERY = gql(`
  query PersonDetail($slug: String!) {
    person(filter: {slug: {eq: $slug}}) {
      id
      name
      age
      portrait {
        alt
        url
        width
        height
        title
      }
    }
  }
`)
