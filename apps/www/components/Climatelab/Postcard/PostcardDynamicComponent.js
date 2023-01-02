import React from 'react'

import { graphql } from '@apollo/client/react/hoc'

import { Loader } from '@project-r/styleguide'

import { gql } from '@apollo/client'
import PostcardGenerator from './PostcardGenerator'

const PostcardDynamicComponent = graphql(
  gql`
    query {
      questionnaire(slug: "klima-postkarte") {
        id
        userHasSubmitted
        questions {
          ... on QuestionInterface {
            userAnswer {
              id
              payload
            }
          }
          ... on QuestionTypeImageChoice {
            cardinality
            options {
              value
              imageUrl
            }
          }
        }
      }
    }
  `,
)(({ data }) => {
  return (
    <Loader
      loading={data.loading}
      error={data.error}
      render={() => {
        console.log({ data })
        if (!data?.questionnaire) return null
        return <PostcardGenerator postcard={data.questionnaire} />
      }}
    />
  )
})

export default PostcardDynamicComponent
