import { Fragment, useMemo, useEffect, useState } from 'react'
import { css } from 'glamor'
import { renderMdast } from '@republik/mdast-react-render'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

import {
  colors,
  Editorial,
  InlineSpinner,
  Interaction,
  createFrontSchema,
} from '@project-r/styleguide'
import StatusError from '../StatusError'

import { useTranslation } from '../../lib/withT'
import Loader from '../Loader'
import Frame from '../Frame'
import HrefLink from '../Link/Href'
import ErrorMessage from '../ErrorMessage'
import CommentLink from '../Discussion/shared/CommentLink'
import DiscussionLink from '../Discussion/shared/DiscussionLink'
import ActionBar from '../ActionBar'

import { PUBLIC_BASE_URL } from '../../lib/constants'
import { useMe } from '../../lib/context/MeContext'
import { useInfiniteScroll } from '../../lib/hooks/useInfiniteScroll'
import { intersperse } from '../../lib/utils/helpers'
import { cleanAsPath } from '../../lib/utils/link'
import { useGetFrontQuery } from './graphql/getFrontQuery.graphql'
import TeaserAudioPlayButton from '../Audio/shared/TeaserAudioPlayButton'
import * as withData from './withData'
import { IconCheckCircle } from '@republik/icons'

const styles = {
  prepublicationNotice: css({
    backgroundColor: colors.social,
    padding: 15,
  }),
  more: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: colors.negative.containerBg,
    color: colors.negative.text,
    padding: '20px 0',
  }),
}

// Years to link to that have a yearly overview page
const archivedYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018]

export const RenderFront = ({ front, nodes, isFrontExtract = false }) => {
  const { t } = useTranslation()
  const { isEditor } = useMe()

  const schema = useMemo(
    () =>
      createFrontSchema({
        Link: HrefLink,
        AudioPlayButton: isFrontExtract ? undefined : TeaserAudioPlayButton,
        CommentLink,
        DiscussionLink,
        ...withData,
        ActionBar,
        t,
      }),
    [],
  )
  const MissingNode = isEditor ? undefined : ({ children }) => children
  return (
    <>
      {renderMdast(
        {
          type: 'root',
          children: nodes.map((v) => v.body),
          lastPublishedAt: front.meta.lastPublishedAt,
        },
        schema,
        { MissingNode },
      )}
    </>
  )
}

let lastMountAt = undefined

const Front = ({
  renderBefore,
  renderAfter,
  containerStyle,
  extractId,
  serverContext,
  finite,
  hasOverviewNav,
  shouldAutoRefetch,
  documentPath,
}) => {
  const { t } = useTranslation()
  const router = useRouter()

  const now = new Date()
  const dailyUpdateTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    5,
  )

  const {
    data,
    loading,
    error,
    refetch,
    fetchMore: nativeFetchMore,
  } = useGetFrontQuery({
    variables: {
      path: documentPath ?? cleanAsPath(router.asPath),
      first: finite ? 1000 : 15,
      before: finite ? 'end' : undefined,
      only: extractId,
    },
  })
  const { front } = data ?? {}

  const shouldRefetch = shouldAutoRefetch && lastMountAt < dailyUpdateTime
  const [isRefetching, setIsRefetching] = useState(shouldRefetch)

  useEffect(() => {
    if (shouldRefetch) {
      refetch().then(() => {
        setIsRefetching(false)
      })
    }
    lastMountAt = new Date()
  }, [])

  const meta = front && {
    ...front.meta,
    title: front.meta.title || t('pages/magazine/title'),
    url: `${PUBLIC_BASE_URL}${front.meta.path}`,
  }

  const fetchMore = () => {
    return nativeFetchMore({
      variables: {
        first: 15,
        after: data.front && data.front.children.pageInfo.endCursor,
        before: undefined,
      },
      updateQuery: (previousResult = {}, { fetchMoreResult = {} }) => {
        const previousSearch = previousResult.front.children || {}
        const currentSearch = fetchMoreResult.front.children || {}
        const previousNodes = previousSearch.nodes || []
        const currentNodes = currentSearch.nodes || []
        const res = {
          ...previousResult,
          front: {
            ...previousResult.front,
            children: {
              ...previousResult.front.children,
              nodes: [...previousNodes, ...currentNodes],
              pageInfo: currentSearch.pageInfo,
            },
          },
        }
        return res
      },
    })
  }

  const hasMore = front && front.children.pageInfo.hasNextPage
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll,
  ] = useInfiniteScroll({
    hasMore,
    loadMore: fetchMore,
  })

  if (extractId) {
    return (
      <Loader
        loading={loading || isRefetching}
        error={error}
        render={() => {
          if (!front) {
            return (
              <StatusError statusCode={404} serverContext={serverContext} />
            )
          }
          return (
            <Fragment>
              <Head>
                <meta name='robots' content='noindex' />
              </Head>
              <RenderFront
                front={front}
                nodes={front.children.nodes}
                isFrontExtract
              />
            </Fragment>
          )
        }}
      />
    )
  }

  return (
    <Frame hasOverviewNav={hasOverviewNav} raw meta={meta}>
      {renderBefore && renderBefore(meta)}
      <Loader
        loading={loading || isRefetching}
        error={error}
        message={t('pages/magazine/title')}
        render={() => {
          if (!front) {
            return (
              <StatusError statusCode={404} serverContext={serverContext} />
            )
          }

          const end = (hasMore || finite) && (
            <div {...styles.more}>
              {finite && (
                <>
                  <IconCheckCircle size={32} />
                  {t('front/finite')}
                </>
              )}
              {finite && (
                <div>
                  <Link href='/feed' passHref legacyBehavior>
                    <Editorial.A style={{ color: colors.negative.text }}>
                      {t('front/finite/feed')}
                    </Editorial.A>
                  </Link>
                </div>
              )}
              <div>
                {loadingMoreError && <ErrorMessage error={loadingMoreError} />}
                {loadingMore && <InlineSpinner />}
                {!infiniteScroll && hasMore && (
                  <Editorial.A
                    href='#'
                    style={{ color: colors.negative.text }}
                    onClick={(event) => {
                      event?.preventDefault()
                      setInfiniteScroll(true)
                    }}
                  >
                    {t('front/loadMore', {
                      count: front.children.nodes.length,
                      remaining:
                        front.children.totalCount - front.children.nodes.length,
                    })}
                  </Editorial.A>
                )}
              </div>
              {front.meta.path === '/' && (
                <div>
                  {t.elements('front/chronology', {
                    years: intersperse(
                      archivedYears.map((year) => (
                        <Link
                          key={year}
                          href={`/${year}`}
                          passHref
                          legacyBehavior
                        >
                          <Editorial.A style={{ color: colors.negative.text }}>
                            {year}
                          </Editorial.A>
                        </Link>
                      )),
                      () => ', ',
                    ),
                  })}
                </div>
              )}
            </div>
          )

          const nodes = front.children.nodes
          const endIndex = nodes.findIndex((node) => node.id === 'end')
          const sliceIndex = endIndex === -1 ? undefined : endIndex

          return (
            <div ref={containerRef} style={containerStyle}>
              {front.meta.prepublication && (
                <div {...styles.prepublicationNotice}>
                  <Interaction.P>
                    {t('front/prepublication/notice')}
                  </Interaction.P>
                </div>
              )}
              <RenderFront front={front} nodes={nodes.slice(0, sliceIndex)} />
              {end}
              {sliceIndex && (
                <>
                  <RenderFront
                    front={front}
                    nodes={nodes.slice(endIndex + 1)}
                  />
                </>
              )}
            </div>
          )
        }}
      />
      {renderAfter && renderAfter(meta)}
    </Frame>
  )
}

export default Front
