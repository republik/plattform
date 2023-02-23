import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { withRouter } from 'next/router'

import Loader from '../Loader'
import Meta from '../Frame/Meta'
import { Content } from '../Frame'

import withT from '../../lib/withT'
import StatusError from '../StatusError'

import { NarrowContainer, A } from '@project-r/styleguide'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../../lib/constants'

import Update from './Detail'
import Link from 'next/link'

const query = gql`
  query UpdatesList {
    updates {
      slug
      title
      text
      metaDescription
      socialMediaImage
      publishedDateTime
    }
  }
`

const Overview = compose(
  withT,
  withRouter,
  graphql(query, {
    props: ({
      data,
      ownProps: {
        router: {
          query: { slug },
        },
      },
    }) => {
      const error = data.error
      let update
      if (slug && data.updates && !error) {
        update =
          data.updates.find((update) => update.slug === slug.join('/')) || 404
      }
      return {
        loading: data.loading,
        updates: data.updates,
        error,
        update,
      }
    },
  }),
)(({ updates, update, t, loading, error, serverContext }) => (
  <Loader
    loading={loading}
    error={error}
    render={() => {
      if (update) {
        if (update === 404) {
          return <StatusError statusCode={404} serverContext={serverContext} />
        }
        return (
          <NarrowContainer>
            <Content>
              <Meta
                data={{
                  title: update.title,
                  description: update.metaDescription,
                  url: `${PUBLIC_BASE_URL}/updates/${update.slug}`,
                  image: update.socialMediaImage,
                }}
              />
              <Update data={update} />
              <Link href='/updates' passHref legacyBehavior>
                <A>{t('updates/all')}</A>
              </Link>
            </Content>
          </NarrowContainer>
        )
      }

      return (
        <NarrowContainer>
          <Content>
            <Meta
              data={{
                pageTitle: t('updates/pageTitle'),
                title: t('updates/title'),
                description: t('updates/metaDescription'),
                url: `${PUBLIC_BASE_URL}/updates`,
                image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
              }}
            />
            {updates.map((update) => (
              <Update key={update.slug} data={update} />
            ))}
          </Content>
        </NarrowContainer>
      )
    }}
  />
))

export default Overview
