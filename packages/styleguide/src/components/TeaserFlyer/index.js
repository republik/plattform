import React from 'react'
import { TeaserSectionTitle } from '../TeaserShared'
import { NarrowContainer } from '../Grid'

const DefaultLink = ({ children }) => children

const TeaserFlyer = ({
  contentTree,
  formatTitle,
  formatPath,
  Link = DefaultLink,
}) => {
  return (
    <>
      <NarrowContainer>
        {/* Render contentTree */}
        <Link href={formatPath} passHref>
          <TeaserSectionTitle href={formatPath}>
            {formatTitle}
          </TeaserSectionTitle>
        </Link>
      </NarrowContainer>
    </>
  )
}

const WrappedTeaserFlyer = (props) => <TeaserFlyer {...props} />

export default TeaserFlyer

WrappedTeaserFlyer.data = {
  config: {
    props: ({ data }) => {
      const node = data.nodes[0]
      return {
        data: {
          loading: data.loading,
          error: data.error,
          formatPath: node?.meta.path,
          formatTitle: node?.meta.format.meta.title,
          contentTree: node?.content,
        },
      }
    },
  },
  query: `
    query getLatestFlyer() {
      latestFlyer: documents(format: "republik/format-journal", first: 1) {
        nodes {
          id
          meta {
            title
            path
            format {
              meta {
                title
              }
            }
          }
          content
        }
      }
    }
  `,
}
