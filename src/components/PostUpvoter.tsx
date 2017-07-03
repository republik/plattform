import * as React from 'react'
import { gql, graphql, OptionProps, QueryProps } from 'react-apollo'

interface OwnProps {
  [prop: string]: any
  upvote?: any
  votes: number
  id: string
}

const PostUpvoter = ({ upvote, votes, id }: OwnProps) => {
  return (
    <button onClick={() => upvote(id, votes + 1)}>
      {votes}
      <style>{`
        button {
          background-color: transparent;
          border: 1px solid #e4e4e4;
          color: #000;
        }
        button:active {
          background-color: transparent;
        }
        button:before {
          align-self: center;
          border-color: transparent transparent #000000 transparent;
          border-style: solid;
          border-width: 0 4px 6px 4px;
          content: "";
          height: 0;
          margin-right: 5px;
          width: 0;
        }
      `}</style>
    </button>
  )
}

const upvotePost = gql`
  mutation updatePost($id: ID!, $votes: Int) {
    updatePost(id: $id, votes: $votes) {
      id
      __typename
      votes
    }
  }
`

export default graphql(upvotePost, {
  props: ({ ownProps, mutate }: OptionProps<OwnProps, {}>) => ({
    upvote: (id: string, votes: number) => {
      if (!mutate) {
        throw new Error('mutate not defined')
      }
      return mutate({
        variables: { id, votes },
        optimisticResponse: {
          __typename: 'Mutation',
          updatePost: {
            __typename: 'Post',
            id: ownProps.id,
            votes: ownProps.votes + 1
          }
        }
      })
    }
  })
})(PostUpvoter)
