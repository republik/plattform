import * as React from 'react'
import { gql, graphql, OptionProps, QueryProps } from 'react-apollo'
import PostUpvoter from './PostUpvoter'
import { Post, AllPostsResult } from '../types/posts'

interface OwnProps {
  [prop: string]: any
  loadMorePosts?: any
}

interface Props extends OwnProps {
  data: QueryProps & AllPostsResult
}

const POSTS_PER_PAGE = 10

const PostList = ({
  data: { allPosts, loading, _allPostsMeta },
  loadMorePosts
}: Props) => {
  if (allPosts && allPosts.length) {
    const areMorePosts = allPosts.length < _allPostsMeta.count
    return (
      <section>
        <ul>
          {allPosts.map((post: Post, index: any) =>
            <li key={post.id}>
              <div>
                <span>
                  {index + 1}.{' '}
                </span>
                <a href={post.url}>
                  {post.title}
                </a>
                <PostUpvoter id={post.id} votes={post.votes} />
              </div>
            </li>
          )}
        </ul>
        {areMorePosts
          ? <button onClick={() => loadMorePosts()}>
              {' '}{loading ? 'Loading...' : 'Show More'}{' '}
            </button>
          : ''}
        <style>{`
          section {
            padding-bottom: 20px;
          }
          li {
            display: block;
            margin-bottom: 10px;
          }
          div {
            align-items: center;
            display: flex;
          }
          a {
            font-size: 14px;
            margin-right: 10px;
            text-decoration: none;
            padding-bottom: 0;
            border: 0;
          }
          span {
            font-size: 14px;
            margin-right: 5px;
          }
          ul {
            margin: 0;
            padding: 0;
          }
          button:before {
            align-self: center;
            border-style: solid;
            border-width: 6px 4px 0 4px;
            border-color: #ffffff transparent transparent transparent;
            content: "";
            height: 0;
            margin-right: 5px;
            width: 0;
          }
        `}</style>
      </section>
    )
  }
  return <div>Loading</div>
}

const allPosts = gql`
  query allPosts($first: Int!, $skip: Int!) {
    allPosts(orderBy: createdAt_DESC, first: $first, skip: $skip) {
      id
      title
      votes
      url
      createdAt
    }
    _allPostsMeta {
      count
    }
  }
`

export default graphql(allPosts, {
  options: {
    variables: {
      skip: 0,
      first: POSTS_PER_PAGE
    }
  },
  props: ({ data }: OptionProps<OwnProps, AllPostsResult>) => ({
    data,
    loadMorePosts: () => {
      if (!data) {
        throw new Error('data object undefined')
      }
      return data.fetchMore({
        variables: {
          skip: data.allPosts.length
        },
        updateQuery: (previousResult: AllPostsResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult
          }
          return {
            ...previousResult,
            ...{
              allPosts: [
                ...previousResult.allPosts,
                ...(fetchMoreResult as AllPostsResult).allPosts
              ]
            }
          }
        }
      })
    }
  })
})(PostList)
