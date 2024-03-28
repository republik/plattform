import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import Head from 'next/head'

import withT from '../../lib/withT'

import Loader from '../Loader'

import { Logo, fontFamilies, inQuotes } from '@project-r/styleguide'

const WIDTH = 1200
const HEIGHT = 628

const styles = {
  container: css({
    position: 'relative',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#fff',
  }),
  logo: css({
    position: 'absolute',
    left: 628 + 50,
    right: 210,
    bottom: 50,
  }),
  image: css({
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 628,
  }),
  text: css({
    position: 'absolute',
    top: 50,
    left: 628 + 50,
    right: 50,
    bottom: 50 + 120,
    wordWrap: 'break-word',
  }),
  quote: css({
    fontSize: 27,
    lineHeight: 1.42,
    fontFamily: fontFamilies.serifRegular,
    margin: '20px 0',
  }),
  number: css({
    fontSize: 30,
    fontFamily: fontFamilies.sansSerifMedium,
  }),
  videoTitle: css({
    fontSize: 60,
    lineHeight: '75px',
    marginBottom: 20,
  }),
  headline: css({
    fontSize: 32,
    fontFamily: fontFamilies.sansSerifMedium,
  }),
}

const fontSizeBoost = (length) => {
  if (length < 40) {
    return 26
  }
  if (length < 50) {
    return 17
  }
  if (length < 80) {
    return 8
  }
  if (length < 100) {
    return 4
  }
  if (length > 400) {
    return -2
  }
  return 0
}

const Item = ({
  loading,
  pkg,
  error,
  t,
  statement: { cards, statement, portrait, name, sequenceNumber } = {},
}) => {
  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const headline = t(
          `testimonial/detail/share/package/${pkg}`,
          undefined,
          '',
        )
        const invert = pkg === 'PROLONG'

        return (
          <div
            {...styles.container}
            style={
              invert
                ? {
                    backgroundColor: '#000',
                    color: '#fff',
                  }
                : undefined
            }
          >
            <Head>
              <meta name='robots' content='noindex' />
            </Head>
            <img {...styles.image} src={portrait} />
            <div {...styles.text}>
              {headline && <div {...styles.headline}>{headline}</div>}
              {statement && (
                <p
                  {...styles.quote}
                  style={{
                    fontSize:
                      24 + fontSizeBoost(statement.length + headline.length),
                  }}
                >
                  {inQuotes(statement)}
                </p>
              )}
              {!!sequenceNumber && (
                <div {...styles.number}>
                  {t('memberships/sequenceNumber/label', {
                    sequenceNumber,
                  })}
                </div>
              )}
            </div>
            <div {...styles.logo}>
              <Logo fill={invert ? '#fff' : '#000'} />
            </div>
          </div>
        )
      }}
    />
  )
}

const query = gql`
  query statements($focus: String!) {
    user(slug: $focus) {
      id
      name
      statement
      portrait
      sequenceNumber
    }
    statements(focus: $focus, first: 1) {
      totalCount
      nodes {
        id
        name
        statement
        portrait
        sequenceNumber
      }
    }
  }
`

export default compose(
  withT,
  graphql(query, {
    props: ({ data, ownProps: { name } }) => {
      return {
        loading: data.loading,
        error: data.error,
        statement: data.user
          ? data.user
          : data.statements &&
            data.statements.nodes &&
            data.statements.nodes[0],
      }
    },
  }),
)(Item)
