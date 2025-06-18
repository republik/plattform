import { useRef, useEffect, createContext } from 'react'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'
import { withApollo } from '@apollo/client/react/hoc'
import debounce from 'lodash/debounce'

import { mediaQueries, A } from '@project-r/styleguide'

import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../../constants'
import { scrollIt } from '../../../lib/utils/scroll'
import withMe from '../../../lib/apollo/withMe'
import { PROGRESS_EXPLAINER_PATH } from '../../../lib/constants'

import { withProgressApi } from './api'
import { useMediaProgress } from '../../Audio/MediaProgress'
import { withRouter } from 'next/router'
import Link from 'next/link'

const MIN_INDEX = 2

export const getFeatureDescription = (t) =>
  t.elements('article/progressprompt/description/feature', {
    link: PROGRESS_EXPLAINER_PATH ? (
      <Link href={PROGRESS_EXPLAINER_PATH} key='link' passHref legacyBehavior>
        <A>{t('article/progressprompt/description/feature/link')}</A>
      </Link>
    ) : null,
  })

export const ProgressContext = createContext({})

const Progress = ({
  children,
  me,
  article,
  isArticle = true,
  router,
  upsertDocumentProgress,
}) => {
  const refContainer = useRef()
  const lastClosestIndex = useRef()
  const refSaveProgress = useRef()
  const lastY = useRef()

  const { getMediaProgress, saveMediaProgress } = useMediaProgress()

  const isTrackingAllowed = me && me.progressConsent === true
  const mobile = () => window.innerWidth < mediaQueries.mBreakPoint
  const headerHeight = () => (mobile() ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT)

  const getProgressElements = () => {
    const progressElements = refContainer.current
      ? Array.from(refContainer.current.querySelectorAll('[data-pos]'))
      : []
    return progressElements
  }

  const getClosestElement = (progressElements) => {
    const getDistanceForIndex = (index) => {
      return Math.abs(
        progressElements[index].getBoundingClientRect().top - headerHeight(),
      )
    }

    let closestIndex =
      (progressElements[lastClosestIndex.current] &&
        lastClosestIndex.current) ||
      0

    let closestDistance = getDistanceForIndex(closestIndex)

    for (let i = closestIndex + 1; i < progressElements.length; i += 1) {
      const distance = getDistanceForIndex(i)
      if (distance > closestDistance) {
        break
      }
      closestDistance = distance
      closestIndex = i
    }

    for (let i = closestIndex - 1; i >= 0; i -= 1) {
      const distance = getDistanceForIndex(i)
      if (distance > closestDistance) {
        break
      }
      closestDistance = distance
      closestIndex = i
    }

    lastClosestIndex.current = closestIndex

    return {
      nodeId: progressElements[closestIndex].getAttribute('data-pos'),
      index: closestIndex,
    }
  }

  const getPercentage = (progressElements) => {
    const lastElement = progressElements[progressElements.length - 1]
    const { bottom } = lastElement.getBoundingClientRect()
    const { top } = refContainer.current.getBoundingClientRect()
    const height = bottom - top
    const yFromArticleTop = Math.max(0, -top + headerHeight())
    const ratio = yFromArticleTop / height
    const percentage =
      ratio === 0 ? 0 : -top + window.innerHeight > height ? 1 : ratio
    return percentage
  }

  refSaveProgress.current = debounce(() => {
    if (!article || !isTrackingAllowed) {
      return
    }

    // measure between debounced calls
    // to handle bouncy upwards scroll on iOS
    // e.g. y200 -> y250 in onScroll -> bounce back to y210
    const y = window.pageYOffset
    const downwards = lastY.current === undefined || y > lastY.current
    lastY.current = y

    if (!downwards) {
      return
    }

    const progressElements = getProgressElements()
    if (!progressElements.length) {
      return
    }

    const element = getClosestElement(progressElements)
    const percentage = getPercentage(progressElements)

    if (
      element &&
      element.nodeId &&
      percentage > 0 &&
      // ignore elements until min index
      element.index >= MIN_INDEX &&
      (!article.userProgress ||
        article.userProgress.nodeId !== element.nodeId ||
        Math.floor(article.userProgress.percentage * 100) !==
          Math.floor(percentage * 100))
    ) {
      upsertDocumentProgress(article.id, percentage, element.nodeId)
    }
  }, 300)

  const restoreArticleProgress = (e) => {
    if (e) {
      e.preventDefault()
    }
    const { percentage, nodeId } = article.userProgress

    const progressElements = getProgressElements()
    const progressElement =
      !!nodeId &&
      progressElements.find((element) => {
        if (element.getAttribute('data-pos') === nodeId) {
          return true
        }
        return false
      })

    if (progressElement) {
      const { top } = progressElement.getBoundingClientRect()
      const isInViewport = top - headerHeight() > 0 && top < window.innerHeight
      // We don't scroll on mobile if the element of interest is already in viewport
      // This may happen on swipe navigation in iPhone X.
      if (!mobile() || !isInViewport) {
        scrollIt(
          window.pageYOffset + top - headerHeight() - (mobile() ? 10 : 20),
          400,
        )
      }
      return
    }
    if (percentage) {
      const { height } = refContainer.current.getBoundingClientRect()
      const offset = percentage * height - headerHeight()
      scrollIt(offset, 400)
    }
  }

  useEffect(() => {
    const onScroll = () => {
      refSaveProgress.current()
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      refSaveProgress.current.cancel()
    }
  }, [])

  const showConsentPrompt =
    isArticle &&
    me &&
    !router.query.trialSignup &&
    me.progressConsent === null &&
    article &&
    article.meta &&
    article.meta.path !== PROGRESS_EXPLAINER_PATH

  return (
    <ProgressContext
      value={{
        getMediaProgress,
        saveMediaProgress,
        restoreArticleProgress,
        showConsentPrompt,
      }}
    >
      <div ref={refContainer}>{children}</div>
    </ProgressContext>
  )
}

Progress.propTypes = {
  children: PropTypes.node,
  me: PropTypes.shape({
    progressConsent: PropTypes.bool,
  }),
  revokeConsent: PropTypes.func,
  submitConsent: PropTypes.func,
  isArticle: PropTypes.bool,
}

export default compose(
  withApollo,
  withProgressApi,
  withMe,
  withRouter,
)(Progress)
