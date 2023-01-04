import React from 'react'

import { graphql } from '@apollo/client/react/hoc'

import { Loader, Interaction } from '@project-r/styleguide'

import { gql } from '@apollo/client'
import PostcardGenerator from './PostcardGenerator'
import { useMe } from '../../../lib/context/MeContext'

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
  const { me, meLoading } = useMe()
  const isClimate = !meLoading && me?.roles.includes('climate')
  return (
    <Loader
      loading={data.loading}
      error={data.error}
      render={() => {
        if (!data?.questionnaire) return null
        return isClimate ? (
          <PostcardGenerator postcard={data.questionnaire} />
        ) : (
          <Interaction.P>
            {' Melden Sie sich zuerst fürs Klimalabor an.'}
          </Interaction.P>
        )
      }}
    />
  )
})

export default PostcardDynamicComponent
