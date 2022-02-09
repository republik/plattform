import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { TeaserEmbedComment } from '@project-r/styleguide'

export const withCommentData = graphql(
  gql`
    ${TeaserEmbedComment.data.query}
  `,
  TeaserEmbedComment.data.config,
)
