import React from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { ascending } from 'd3-array'
import { Loader } from '@project-r/styleguide'

import {
  GetCompleteFrontOverviewDocument,
  GetFrontOverviewYearDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'

import StatusError from '../StatusError'
import Frame from '../Frame'
import TeaserBlock from './TeaserBlock'
import TimelineNavigation from './TimelineNavigation'

import {
  prepareTeasersForYear,
  filterTeasersByMonth,
  getMonthsWithContent,
  getNearestMonthWithContent,
} from './yearDataUtils'

interface OverviewMonthPageProps {
  year: number
  month: number
  serverContext?: any
}

const ARCHIVED_FRONT_DOCUMENTS: {
  [year: number]: { path: string }
} = {
  2018: { path: '/2018' },
  2019: { path: '/2019' },
  2020: { path: '/2020' },
  2021: { path: '/2021' },
  2022: { path: '/2022' },
  2023: { path: '/2023' },
  2024: { path: '/2024' },
}

const OverviewMonthPage: React.FC<OverviewMonthPageProps> = ({
  year,
  month,
  serverContext,
}) => {
  const router = useRouter()

  // Determine which query to use based on known years
  const isArchivedYear = ARCHIVED_FRONT_DOCUMENTS[year]
  const useArchivedFrontQuery = !!isArchivedYear

  // Query 1: For archived years - get complete document (e.g., /2024)
  const {
    data: archivedFrontData,
    loading: archivedFrontLoading,
    error: archivedFrontError,
  } = useQuery(GetCompleteFrontOverviewDocument, {
    variables: isArchivedYear || { path: '/' },
    skip: !useArchivedFrontQuery,
  })

  // Query 2: For current year - get children from main front document (/)
  const {
    data: currentYearData,
    loading: currentYearLoading,
    error: currentYearError,
  } = useQuery(GetFrontOverviewYearDocument, {
    variables: isArchivedYear ? { after: isArchivedYear.path } : {},
    skip: useArchivedFrontQuery,
  })

  // Use data from whichever query is active
  const data = useArchivedFrontQuery ? archivedFrontData : currentYearData
  const loading = useArchivedFrontQuery
    ? archivedFrontLoading
    : currentYearLoading
  const error = useArchivedFrontQuery ? archivedFrontError : currentYearError

  if (loading) {
    return (
      <Frame pageColorSchemeKey='dark'>
        <Loader loading={true} style={{ minHeight: '90vh' }} />
      </Frame>
    )
  }

  if (error) {
    return (
      <Frame pageColorSchemeKey='dark'>
        <Loader loading={false} error={error} style={{ minHeight: '90vh' }} />
      </Frame>
    )
  }

  // Prepare all teasers for the year
  const allYearTeasers = prepareTeasersForYear(data?.front || null, year)

  // Get months with content
  const monthsWithContent = getMonthsWithContent(allYearTeasers, year)

  // Check if current month has content, redirect if not
  if (
    typeof window !== 'undefined' &&
    !monthsWithContent.includes(month) &&
    monthsWithContent.length > 0
  ) {
    const nearestMonth = getNearestMonthWithContent(allYearTeasers, year, month)
    if (nearestMonth && nearestMonth !== month) {
      router.replace(`/${year}/${nearestMonth}`)
      return null
    }
  }

  // Filter teasers for current month
  const monthTeasers = filterTeasersByMonth(allYearTeasers, year, month).sort(
    (a, b) => ascending(a.publishDate, b.publishDate),
  )

  // Show 404 if no teasers found
  if (!loading && !error && monthTeasers.length === 0) {
    return (
      <Frame raw>
        <StatusError statusCode={404} serverContext={serverContext} />
      </Frame>
    )
  }

  return (
    <Frame raw pageColorSchemeKey='dark'>
      <TimelineNavigation
        year={year}
        currentMonth={month}
        monthsWithContent={monthsWithContent}
      />
      <TeaserBlock teasers={monthTeasers} />
    </Frame>
  )
}

export default OverviewMonthPage
