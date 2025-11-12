import { ApolloConsumer, ApolloProvider, gql } from '@apollo/client'
import { Mutation, Query, Subscription } from '@apollo/client/react/components'
import {
  graphql,
  withApollo,
  withMutation,
  withQuery,
  withSubscription,
} from '@apollo/client/react/hoc'
import {
  createArticleSchema,
  createDiscussionSchema,
  createDossierSchema,
  createFormatSchema,
  createNewsletterWebSchema,
  createPageSchema,
  createRequire,
  createSectionSchema,
  TeaserEmbedComment,
} from '@project-r/styleguide'

import { renderMdast } from '@republik/mdast-react-render'

import { useMe } from 'lib/context/MeContext'
import { useInNativeApp } from 'lib/withInNativeApp'
import { useTranslation } from 'lib/withT'

// legacy imports for old-style dynamic components
import compose from 'lodash/flowRight'
import { useContext, useMemo, useRef } from 'react'

import { AudioContext } from '../Audio/AudioProvider'
import TeaserAudioPlayButton from '../Audio/shared/TeaserAudioPlayButton'
import { AudioPlayerLocations } from '../Audio/types/AudioActionTracking'
import CommentLink from '../Discussion/shared/CommentLink'
import HrefLink from '../Link/Href'

import { BrowserOnlyActionBar } from './BrowserOnly'
import { dynamicComponentIdentifiers } from './DynamicComponents'

const schemaCreators = {
  editorial: createArticleSchema,
  meta: createArticleSchema,
  article: createArticleSchema,
  format: createFormatSchema,
  dossier: createDossierSchema,
  discussion: createDiscussionSchema,
  editorialNewsletter: createNewsletterWebSchema,
  section: createSectionSchema,
  page: createPageSchema,
}

const getSchemaCreator = (template) => {
  const key = template || Object.keys(schemaCreators)[0]
  const schema = schemaCreators[key]

  if (!schema) {
    try {
      console.error(`Unkown Schema ${key}`)
    } catch (e) {
      console.error(e)
    }

    return () => {
      return
    }
  }
  return schema
}

const dynamicComponentRequire = createRequire().alias({
  'react-apollo': {
    // Reexport react-apollo
    // (work around until all dynamic components are updated)
    // ApolloContext is no longer available but is exported in old versions of react-apollo
    ApolloConsumer,
    ApolloProvider,
    Query,
    Mutation,
    Subscription,
    graphql,
    withQuery,
    withMutation,
    withSubscription,
    withApollo,
    compose,
  },
  // Reexport graphql-tag to be used by dynamic-components
  'graphql-tag': gql,
})

export const withCommentData = graphql(
  gql`
    ${TeaserEmbedComment.data.query}
  `,
  TeaserEmbedComment.data.config,
)

const useSchema = ({
  meta,
  article,
  showPlayButton,
}): {
  schema: object
  renderSchema: (content: object) => void
} => {
  const { isEditor } = useMe()
  const { t } = useTranslation()
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  const { toggleAudioPlayer } = useContext(AudioContext)
  const toggleAudioPlayerRef = useRef(toggleAudioPlayer)
  toggleAudioPlayerRef.current = toggleAudioPlayer
  const showPlayButtonRef = useRef(showPlayButton)
  showPlayButtonRef.current = showPlayButton

  const titleBreakout = meta?.series?.overview?.id === article?.id

  const MissingNode = isEditor ? undefined : ({ children }) => children

  const template = meta?.template
  const audioProps = {
    id: article?.id,
    meta: {
      title: meta?.title,
      path: meta?.path,
      publishDate: meta?.publishDate,
      image: meta?.image,
      audioSource: meta?.audioSource,
    },
  }
  const audioPropsRef = useRef(audioProps)
  audioPropsRef.current = audioProps

  const schema = useMemo(() => {
    return (
      template &&
      getSchemaCreator(template)({
        t,
        Link: HrefLink,
        plattformUnauthorizedZoneText: inNativeApp
          ? t('plattformUnauthorizedZoneText/native')
          : undefined,
        dynamicComponentRequire,
        dynamicComponentIdentifiers,
        titleMargin: false,
        titleBreakout,
        onAudioCoverClick: () =>
          toggleAudioPlayerRef.current(
            audioPropsRef.current,
            AudioPlayerLocations.ARTICLE,
          ),
        getVideoPlayerProps:
          inNativeApp && !inNativeIOSApp
            ? (props) => ({
                ...props,
                fullWindow: true,
                onFull: (isFull) => {
                  postMessage({
                    type: isFull ? 'fullscreen-enter' : 'fullscreen-exit',
                  })
                },
              })
            : undefined,
        withCommentData,
        CommentLink,
        ActionBar: BrowserOnlyActionBar,
        AudioPlayButton: showPlayButtonRef.current
          ? TeaserAudioPlayButton
          : undefined,
      })
    )
  }, [template, inNativeApp, inNativeIOSApp, titleBreakout, t])

  const renderSchema = (content) =>
    renderMdast(
      {
        ...content,
        format: meta.format,
        section: meta.section,
        series: meta.series,
        repoId: article.repoId,
      },
      schema,
      { MissingNode },
    )

  return {
    schema,
    renderSchema,
  }
}

export default useSchema
