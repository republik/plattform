import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import Loader from '../Loader'
import { RenderFront } from '../Front'

const MiniFront = ({ data: { loading, error, front }, t }) => {
  return (
    <Loader
      loading={loading}
      error={error}
      render={() =>
        front ? (
          <RenderFront
            t={t}
            isEditor={false}
            front={front}
            nodes={front.children.nodes}
          />
        ) : null
      }
    />
  )
}

const query = gql`
  query MarketingMiniFront {
    front: document(path: "/marketing") {
      id
      children {
        totalCount
        nodes {
          id
          body
        }
      }
      meta {
        prepublication
        lastPublishedAt
      }
    }
  }
`

export default compose(graphql(query))(MiniFront)
