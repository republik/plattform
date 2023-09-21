import { gql } from '../gql'

export const PEOPLE_QUERY = gql(`
  query PeopleQuery {
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
