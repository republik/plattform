import { useRef, useEffect, createContext } from 'react'
import debounce from 'lodash/debounce'

import { mediaQueries } from '@project-r/styleguide'

import { HEADER_HEIGHT } from '../../constants'
import { scrollIt } from '../../../lib/utils/scroll'

import { useProgress } from './api'
import { useMediaProgress } from '../../Audio/MediaProgress'
import { useMe } from '../../../lib/context/MeContext'

const MIN_INDEX = 2

export const ProgressContext = createContext({})

const Progress = ({ children, documentPath }) => {
  const refContainer = useRef()
  const lastClosestIndex = useRef()
  const refSaveProgress = useRef()
  const lastY = useRef()
  const { progressConsent } = useMe()
  const { upsertDocumentProgress, useDocumentProgress } = useProgress()

  const { getMediaProgress, saveMediaProgress } = useMediaProgress()
  
  const { data } = useDocumentProgress({ path: documentPath })
  const { userProgress, id: documentId } = data?.document || {}

  const mobile = () => window.innerWidth < mediaQueries.mBreakPoint

  const getProgressElements = () => {
    const progressElements = refContainer.current
      ? Array.from(refContainer.current.querySelectorAll('[data-pos]'))
      : []
    return progressElements
  }

  const getClosestElement = (progressElements) => {
    const getDistanceForIndex = (index) => {
      return Math.abs(
        progressElements[index].getBoundingClientRect().top - HEADER_HEIGHT,
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
    const yFromArticleTop = Math.max(0, -top + HEADER_HEIGHT)
    const ratio = yFromArticleTop / height
    const percentage =
      ratio === 0 ? 0 : -top + window.innerHeight > height ? 1 : ratio
    return percentage
  }

  refSaveProgress.current = debounce(() => {
    if (!documentPath || !progressConsent) {
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
      (!userProgress ||
        userProgress.nodeId !== element.nodeId ||
        Math.floor(userProgress.percentage * 100) !==
          Math.floor(percentage * 100))
    ) {
      upsertDocumentProgress({
        variables: {
          documentId: documentId,
          percentage,
          nodeId: element.nodeId,
        },
      })
    }
  }, 300)

  const restoreArticleProgress = (e) => {
    if (e) {
      e.preventDefault()
    }
    const { percentage, nodeId } = userProgress

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
      const isInViewport = top - HEADER_HEIGHT > 0 && top < window.innerHeight
      // We don't scroll on mobile if the element of interest is already in viewport
      // This may happen on swipe navigation in iPhone X.
      if (!mobile() || !isInViewport) {
        scrollIt(
          window.pageYOffset + top - HEADER_HEIGHT - (mobile() ? 10 : 20),
          400,
        )
      }
      return
    }
    if (percentage) {
      const { height } = refContainer.current.getBoundingClientRect()
      const offset = percentage * height - HEADER_HEIGHT
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

  return (
    <ProgressContext
      value={{
        getMediaProgress,
        saveMediaProgress,
        restoreArticleProgress,
        useDocumentProgress,
      }}
    >
      <div ref={refContainer}>{children}</div>
    </ProgressContext>
  )
}

export default Progress
