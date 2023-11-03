import { gql } from '../gql'

export const CHALLENGE_ACCEPTED_PERSON_LIST_QUERY = gql(`
query ChallengeAcceptedPersonListQuery {
  people: allChallengeAcceptedPeople(first: 50, orderBy: size_ASC) {
    id
    slug
    name
    size
    portrait {
      url
      height
      width
    }
  }
}
`)
