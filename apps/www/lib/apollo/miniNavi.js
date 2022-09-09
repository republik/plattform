import { gql, useQuery } from '@apollo/client'

export const miniNaviQuery = gql`
  query miniNavi {
    documents(format: "republik/format-journal", first: 1) {
      nodes {
        id
        meta {
          title
          path
          publishDate
        }
      }
    }
  }
`

export const useFlyerMeta = () => {
  const { data } = useQuery(miniNaviQuery)

  return data?.documents.nodes[0]?.meta
}
