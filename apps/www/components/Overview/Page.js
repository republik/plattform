import { FrontDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import {
  Button,
  Interaction,
  Loader,
  useColorContext,
} from '@project-r/styleguide'
import { ascending, max } from 'd3-array'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import { swissTime } from '../../lib/utils/format'
import { useTranslation } from '../../lib/withT'

import Frame from '../../components/Frame'
import StatusError from '../../components/StatusError'
// import TeaserBlock from '../../components/Overview/TeaserBlock'
import Link from 'next/link'
import { TeaserBlock } from '../../components/Overview/TeaserBlock2'
import { useMe } from '../../lib/context/MeContext'
import { P } from './Elements'
import { getTeasersFromDocument } from './utils'

// ATTENTION: use last year here where a split Front document exists, e.g. republik/magazine-2023
// TODO: Figure out how we can derive this dynamically from the Fronts query (probably should prerender this page)
const LAST_ARCHIVED_YEAR = 2024

const formatWeekRaw = swissTime.format('%W')
const formatWeek = (date) => `Woche ${+formatWeekRaw(date) + 1}`

const formatByInterval = {
  wochen: formatWeek,
  monate: swissTime.format('%B'),
}

const FrontOverview = ({ year, text, serverContext }) => {
  const { pathname } = useRouter()
  const { t } = useTranslation()

  const { isMember, me } = useMe()
  const [highlight, setHighlight] = useState()
  const [colorScheme] = useColorContext()

  const path = year <= LAST_ARCHIVED_YEAR ? `/${year}` : '/'

  const { data, loading, error } = useQuery(FrontDocument, {
    variables: { path },
  })

  const onHighlight = (highlighFunction) => setHighlight(() => highlighFunction)

  const startDate = new Date(`${year - 1}-12-31T23:00:00.000Z`)
  const endDate = new Date(`${year}-12-31T23:00:00.000Z`)
  const interval = pathname.match(/\/wochen$/) ? 'wochen' : 'monate'
  const formatDate = formatByInterval[interval]

  const meta = {
    title: t.first(
      [
        `overview/${year}/meta/title/${interval}`,
        `overview/meta/title/${interval}`,
        `overview/${year}/meta/title`,
        'overview/meta/title',
      ],
      {
        year,
      },
    ),
    description: t.first(
      [
        `overview/${year}/meta/description/${interval}`,
        `overview/meta/description/${interval}`,
        `overview/${year}/meta/description`,
        'overview/meta/description',
      ],
      { year },
      '',
    ),
    image: [2018, 2019].includes(year)
      ? `${CDN_FRONTEND_BASE_URL}/static/social-media/overview${year}.png`
      : `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
  }

  const teasers = getTeasersFromDocument(data?.front)
    .reverse()
    .filter((teaser, i, all) => {
      const publishDates = teaser.nodes
        .map(
          (node) =>
            node.data.urlMeta &&
            // workaround for «aufdatierte» tutorials and meta texts
            node.data.urlMeta.format !== 'republik/format-aus-der-redaktion' &&
            new Date(node.data.urlMeta.publishDate),
        )
        .filter(Boolean)

      teaser.publishDate = publishDates.length
        ? max(publishDates)
        : i > 0
        ? all[i - 1].publishDate
        : undefined
      return (
        teaser.publishDate &&
        teaser.publishDate >= startDate &&
        teaser.publishDate < endDate
      )
    })
    .sort((a, b) => ascending(a.publishDate, b.publishDate))

  if (!loading && !error && !teasers.length) {
    return (
      <Frame raw>
        <StatusError statusCode={404} serverContext={serverContext} />
      </Frame>
    )
  }

  const groupedTeasers = teasers.reduce(
    ([all, last], teaser) => {
      const key = formatDate(teaser.publishDate)
      if (!last || key !== last.key) {
        const existingGroup = all.find((d) => d.key === key)
        if (existingGroup) {
          existingGroup.values.push(teaser)
          return [all, existingGroup]
        }

        const newGroup = { key, values: [teaser] }
        all.push(newGroup)
        return [all, newGroup]
      }
      last.values.push(teaser)
      return [all, last]
    },
    [[]],
  )[0]

  if (path === '/') {
    groupedTeasers.reverse()
    groupedTeasers.forEach((m) => m.values.reverse())
  }

  return (
    <Frame meta={meta} pageColorSchemeKey='dark'>
      <Interaction.H1
        {...colorScheme.set('color', 'text')}
        style={{ marginBottom: 5 }}
      >
        {t.first(
          [
            `overview/${year}/title/${interval}`,
            `overview/title/${interval}`,
            `overview/${year}/title`,
            'overview/title',
          ],
          { year },
        )}
      </Interaction.H1>

      <P style={{ marginBottom: 10 }}>
        {isMember
          ? t.first([`overview/${year}/lead`, 'overview/lead'], { year }, '')
          : t.elements(`overview/lead/${me ? 'pledge' : 'signIn'}`)}
      </P>
      {!isMember && (
        <Link key='pledgeBefore' href='/angebote' passHref legacyBehavior>
          <Button white>{t('overview/lead/pledgeButton')}</Button>
        </Link>
      )}

      <Loader
        loading={loading}
        error={error}
        style={{ minHeight: `calc(90vh)` }}
        render={() => {
          return groupedTeasers.map(({ key, values }, i) => {
            const Text = text[key]
            return (
              <div
                style={{ marginTop: 50 }}
                key={key}
                onClick={() => {
                  // a no-op for mobile safari
                  // - causes mouse enter and leave to be triggered
                }}
              >
                <Interaction.H2
                  style={{
                    marginBottom: 5,
                    marginTop: 0,
                  }}
                  {...colorScheme.set('color', 'text')}
                >
                  {key}
                </Interaction.H2>
                <P style={{ marginBottom: 20 }}>
                  {Text && (
                    <Text highlight={highlight} onHighlight={onHighlight} />
                  )}
                </P>
                <TeaserBlock
                  path={path}
                  teasers={values}
                  highlight={highlight}
                  onHighlight={onHighlight}
                />
              </div>
            )
          })
        }}
      />

      {!isMember && (
        <Link key='pledgeAfter' href='/angebote' passHref legacyBehavior>
          <Button white style={{ marginTop: 100 }}>
            {t('overview/after/pledgeButton')}
          </Button>
        </Link>
      )}
    </Frame>
  )
}

export default FrontOverview
