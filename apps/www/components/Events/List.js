import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import { ascending, descending } from 'd3-array'
import { css } from 'glamor'
import { timeDay } from 'd3-time'
import { withRouter } from 'next/router'

import {
  NarrowContainer,
  Interaction,
  A,
  mediaQueries,
} from '@project-r/styleguide'

import { Content } from '../Frame'
import { parseDate } from '../../lib/utils/format'
import Event, { EVENT_PADDING } from './Detail'
import Loader from '../Loader'
import Meta from '../Frame/Meta'
import StatusError from '../StatusError'
import withT from '../../lib/withT'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import Link from 'next/link'

const { H3 } = Interaction

const styles = {
  sectionTitle: css({
    marginBottom: 15,
    [mediaQueries.mUp]: {
      paddingLeft: EVENT_PADDING,
    },
  }),
}

const query = gql`
  query EventsList {
    events {
      slug
      title
      description
      metaDescription
      link
      date
      time
      where
      locationLink
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
      const events =
        data.events &&
        data.events.map((event) => ({
          ...event,
          __parsedDate: parseDate(event.date),
        }))
      let event

      if (slug && events && !error) {
        event = events.find((event) => event.slug === slug) || 404
      }

      return {
        loading: data.loading,
        events,
        event,
        error,
      }
    },
  }),
)(({ events, event, t, loading, error, serverContext }) => (
  <Loader
    loading={loading}
    error={error}
    render={() => {
      if (event) {
        if (event === 404) {
          return <StatusError statusCode={404} serverContext={serverContext} />
        }
        return (
          <NarrowContainer>
            <Content>
              <Meta
                data={{
                  title: event.title,
                  description: event.metaDescription,
                  url: `${PUBLIC_BASE_URL}/veranstaltung/${event.slug}`,
                  image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
                }}
              />
              <Event data={event} />
              <Link href='/veranstaltungen' passHref legacyBehavior>
                <A>{t('events/all')}</A>
              </Link>
            </Content>
          </NarrowContainer>
        )
      }

      const today = timeDay.floor(new Date())
      const upcoming = events
        .filter((event) => today <= event.__parsedDate)
        .sort((a, b) => ascending(a.__parsedDate, b.__parsedDate))
      const past = events
        .filter((event) => today > event.__parsedDate)
        .sort((a, b) => descending(a.__parsedDate, b.__parsedDate))

      return (
        <NarrowContainer>
          <Content>
            <Meta
              data={{
                pageTitle: t('events/pageTitle'),
                title: t('events/title'),
                description: t('events/metaDescription'),
                url: `${PUBLIC_BASE_URL}/events`,
                image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
              }}
            />
            {!!upcoming.length && (
              <H3 {...styles.sectionTitle}>{t('events/upcoming')}</H3>
            )}
            {upcoming.map((event) => (
              <Event key={event.slug} data={event} />
            ))}
            {!!past.length && (
              <H3 {...styles.sectionTitle}>{t('events/past')}</H3>
            )}
            {past.map((event) => (
              <Event key={event.slug} data={event} />
            ))}
          </Content>
        </NarrowContainer>
      )
    }}
  />
))

export default Overview
