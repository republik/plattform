import { gql } from '@apollo/client'

export const cardFragment = gql`
  fragment Card on Card {
    id
    user {
      id
      name
      portrait(properties: { bw: false, width: 700, height: 800 })
      slug
    }
    payload
    statement {
      id
      preview(length: 100) {
        string
        more
      }
      comments {
        totalCount
      }
    }
  }
`
