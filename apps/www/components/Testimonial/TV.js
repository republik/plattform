import { useEffect, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import { css } from 'glamor'

import Head from 'next/head'

import { useTranslation } from '../../lib/withT'

import Loader from '../Loader'

import {
  fontFamilies,
  Interaction,
  Logo,
  P,
  inQuotes,
} from '@project-r/styleguide'

const toViewport = (px) => `${px / 18}vw`

const MIDDLE = 56.25

const styles = {
  container: css({
    position: 'relative',
    width: '100%',
    paddingBottom: `${(9 / 16) * 100}%`,
    backgroundColor: '#fff',
  }),
  screen: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
  }),
  logo: css({
    position: 'absolute',
    left: `${MIDDLE + 5}%`,
    right: '5%',
    bottom: '5%',
  }),
  image: css({
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: `${MIDDLE}%`,
  }),
  text: css({
    position: 'absolute',
    top: '5%',
    left: `${MIDDLE + 5}%`,
    right: '5%',
    bottom: `${10 + 5}%`,
    wordWrap: 'break-word',
  }),
  quote: css({
    fontSize: toViewport(27),
    lineHeight: 1.42,
  }),
  number: css({
    fontSize: toViewport(30),
    fontFamily: fontFamilies.sansSerifMedium,
  }),
  name: css({
    fontSize: toViewport(60),
    lineHeight: 1.25,
    marginBottom: toViewport(20),
  }),
  role: css({
    fontSize: toViewport(30),
    lineHeight: 1.25,
    marginBottom: toViewport(20),
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

const Item = ({ statement, t }) => {
  if (!statement) {
    return null
  }

  const {
    statement: statementString,
    portrait,
    name,
    role,
    sequenceNumber,
  } = statement

  return (
    <div {...styles.container}>
      <div {...styles.screen}>
        <Head>
          <meta name='robots' content='noindex' />
        </Head>
        <img {...styles.image} src={portrait} alt={name} />
        <div {...styles.text}>
          <Interaction.H2 {...styles.name}>{name}</Interaction.H2>
          <Interaction.P {...styles.role}>{role}</Interaction.P>
          {statementString && (
            <P
              {...styles.quote}
              style={{
                fontSize: toViewport(24 + fontSizeBoost(statementString.length)),
              }}
            >
              {inQuotes(statementString)}
            </P>
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
          <Logo />
        </div>
      </div>
    </div>
  )
}

const query = gql`
  query statements($seed: Float!, $first: Int!) {
    statements(seed: $seed, first: $first) {
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

// Generate a seed that changes once per day (at midnight UTC)
const getDailySeed = () => {
  const now = new Date()
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24))
  // Convert to seed range [-1, 1]
  return (daysSinceEpoch % 1000) / 500 - 1
}

const TV = ({ duration = 30000 }) => {
  const { t } = useTranslation()
  const [seed] = useState(() => getDailySeed())
  const [shuffledStatements, setShuffledStatements] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch 100 testimonials once
  const { data, loading, error } = useQuery(query, {
    variables: {
      seed,
      first: 100,
    },
  })

  const statements = data?.statements?.nodes || []

  // Shuffle statements once when loaded
  useEffect(() => {
    if (statements.length === 0) {
      return
    }

    const shuffled = [...statements]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    setShuffledStatements(shuffled)
  }, [statements])

  // Rotate through shuffled statements client-side
  useEffect(() => {
    if (shuffledStatements.length === 0) {
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledStatements.length)
    }, duration)

    return () => clearInterval(interval)
  }, [shuffledStatements.length, duration])

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => (
        <Item statement={shuffledStatements[currentIndex]} t={t} />
      )}
    />
  )
}

export default TV
