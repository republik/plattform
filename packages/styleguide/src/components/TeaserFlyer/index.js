import React from 'react'
import { TeaserSectionTitle } from '../TeaserShared'
import { NarrowContainer } from '../Grid'

const DefaultLink = ({ children }) => children

const TeaserFlyer = ({
  contentTree,
  formatTitle,
  flyerPath,
  Link = DefaultLink,
}) => {
  return (
    <>
      <NarrowContainer>
        {/* Render contentTree */}
        <Link href={flyerPath} passHref>
          <TeaserSectionTitle href={flyerPath}>
            {formatTitle}
          </TeaserSectionTitle>
        </Link>
      </NarrowContainer>
    </>
  )
}

const WrappedTeaserFlyer = (props) => <TeaserFlyer {...props} />

export default WrappedTeaserFlyer

WrappedTeaserFlyer.data = {
  config: {
    props: ({ data }) => {
      const node = data.nodes[0]
      return {
        data: {
          loading: data.loading,
          error: data.error,
          flyerPath: node?.meta.path,
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
