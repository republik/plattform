import { useState, useRef, useEffect, useMemo } from 'react'
import { css } from 'glamor'
import { ascending } from 'd3-array'
import { useSpring, animated, interpolate } from 'react-spring/web.cjs'
import { useGesture } from 'react-use-gesture/dist/index.js'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { useRouter } from 'next/router'
import { gql } from '@apollo/client'

import {
  Editorial,
  Interaction,
  mediaQueries,
  usePrevious,
  fontStyles,
  RawHtml,
  Label,
  plainButtonRule,
} from '@project-r/styleguide'

import IgnoreIcon from './IgnoreIcon'

import withT from '../../lib/withT'
import { useWindowSize } from '../../lib/hooks/useWindowSize'
import createPersistedState from '../../lib/hooks/use-persisted-state'
import withMe from '../../lib/apollo/withMe'
import { ZINDEX_HEADER } from '../constants'

import Details from './Details'
import Card, { styles as cardStyles, MEDIUM_MIN_WIDTH } from './Card'
import Container from './Container'
import Cantons from './Cantons'
import MyList from './MyList'
import Overlay from './Overlay'
import Preferences from './Preferences'
import { useQueue } from './useQueue'
import TrialForm from './TrialForm'

import { cardColors } from './constants'
import Link from 'next/link'
import DiscussionContextProvider from '../Discussion/context/DiscussionContextProvider'
import Discussion from '../Discussion/Discussion'
import { IconFilterList, IconFollow, IconList, IconRevert } from '@republik/icons'

const styles = {
  swipeIndicator: css({
    position: 'absolute',
    textTransform: 'uppercase',
    padding: '3px 6px',
    borderRadius: 3,
    fontSize: 20,
    ...fontStyles.sansSerifMedium,
    color: '#fff',
    pointerEvents: 'none',
    // boxShadow: '0px 0px 15px -3px #fff',
    transition: 'opacity 300ms',
    transitionDelay: '10ms',
  }),
  swipeIndicatorLeft: css({
    transform: 'rotate(42deg)',
    right: 0,
    top: 50,
    backgroundColor: cardColors.left,
  }),
  swipeIndicatorRight: css({
    transform: 'rotate(-12deg)',
    left: 10,
    top: 25,
    backgroundColor: cardColors.right,
  }),
  button: css(plainButtonRule, {
    display: 'inline-block',
    borderRadius: '50%',
    margin: 10,
    [mediaQueries.mUp]: {
      margin: 20,
    },
    lineHeight: '18px',
    verticalAlign: 'middle',
    boxShadow:
      '0 12.5px 100px -10px rgba(50, 50, 73, 0.4), 0 10px 10px -10px rgba(50, 50, 73, 0.3)',
    transition: 'opacity 300ms',
    ...fontStyles.sansSerifMedium,
    color: '#fff',
    textAlign: 'center',
  }),
  buttonSmall: css({
    width: 30,
    height: 30,
    padding: 5,
    '& svg': {
      width: 20,
      height: 20,
    },
    [mediaQueries.mUp]: {
      width: 40,
      height: 40,
      padding: 10,
    },
  }),
  buttonBig: css({
    width: 45,
    height: 45,
    padding: 10,
    '& svg': {
      width: 25,
      height: 25,
    },
    [mediaQueries.mUp]: {
      width: 55,
      height: 55,
      padding: 15,
    },
  }),
  buttonPanel: css({
    position: 'fixed',
    bottom: 30,
    left: 5,
    right: 5,
    textAlign: 'center',
  }),
  switch: css({
    position: 'absolute',
    left: 8,
    top: 5,
    maxWidth: '35%',
    fontSize: 14,
    [mediaQueries.mUp]: {
      fontSize: 16,
    },
  }),
  bottom: css({
    position: 'absolute',
    top: 100,
    left: 50,
    right: 50,
    bottom: 120,
    textAlign: 'center',
  }),
  canton: css(Interaction.fontRule, {
    position: 'absolute',
    right: 8,
    top: 5,
    textAlign: 'right',
    maxWidth: '64%',
    '& svg': {
      float: 'right',
      width: 40,
      height: 40,
      marginLeft: 10,
      marginBottom: 10,
    },
    fontSize: 14,
    [mediaQueries.mUp]: {
      fontSize: 16,
    },
  }),
  trial: css({
    display: 'flex',
    height: '100%',
    padding: 20,
    ...fontStyles.serifTitle,
    fontSize: 28,
    alignItems: 'center',
    justifyContent: 'center',
  }),
}

const randDegs = 5
const to = () => ({
  x: 0,
  y: -5 + Math.random() * 10,
  scale: 1,
  rot: -randDegs + Math.random() * randDegs * 2,
  opacity: 1,
})
const fromFall = () => ({
  x: 0,
  rot: 0,
  scale: 1.5,
  y: -1200,
  opacity: 1,
})
const fromSwiped = ({ dir, velocity, xDelta }, windowWidth) => ({
  x: (200 + windowWidth) * dir,
  // how much the card tilts, flicking it harder makes it rotate faster
  rot: xDelta / 100 + dir * 10 * velocity,
  scale: 1,
})

const interpolateTransform = (r, s) =>
  `rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

const specials = {
  trial: ({ t }) => (
    <div {...styles.trial}>
      <div {...styles.trialInner}>{t('components/Card/Group/promo/trial')}</div>
    </div>
  ),
}

const SpringCard = ({
  t,
  index,
  zIndex,
  card,
  bindGestures,
  cardWidth,
  fallIn,
  isTop,
  isHot,
  dragTime,
  swiped,
  windowWidth,
  indicateDir,
  indicatePastDir,
  onDetail,
  group,
  mySmartspider,
  medianSmartspiderQuery,
}) => {
  const [props, set] = useSpring(() =>
    fallIn && !swiped
      ? { ...to(), delay: fallIn * 100, from: fromFall() }
      : {
          ...to(),
          ...(swiped && fromSwiped(swiped, windowWidth)),
          from: { opacity: 0 },
        },
  )
  const { x, y, rot, scale, opacity } = props
  const wasTop = usePrevious(isTop)
  const wasSwiped = usePrevious(swiped)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (swiped) {
      set({
        ...fromSwiped(swiped, windowWidth),
        delay: undefined,
        config: {
          friction: 50,
          tension: 200,
        },
      })
    } else if (isTop) {
      set({
        scale: 1.05,
        rot: 0,
        x: 0,
      })
    } else if (wasTop || wasSwiped) {
      set(to())
    }
  }, [swiped, isTop, wasTop, wasSwiped, windowWidth])

  const willChange = isHot ? 'transform' : undefined
  const dir =
    indicateDir ||
    (swiped && swiped.dir) ||
    (slide === 0 && indicatePastDir && indicatePastDir * 0.8)
  const Special = specials[card.id]

  return (
    <animated.div
      {...cardStyles.card}
      style={{
        transform: interpolate(
          [x, y],
          (x, y) => `translate3d(${x}px,${y}px,0)`,
        ),
        zIndex,
        willChange,
      }}
    >
      <animated.div
        {...(swiped
          ? undefined // prevent catching a card after swipping
          : bindGestures(set, card, isTop, index))}
        {...cardStyles.cardInner}
        style={{
          width: cardWidth,
          height: cardWidth * 1.4,
          opacity,
          transform: interpolate([rot, scale], interpolateTransform),
          willChange,
        }}
      >
        {Special ? (
          <Special t={t} />
        ) : (
          <Card
            key={card.id}
            t={t}
            {...card}
            mySmartspider={mySmartspider}
            medianSmartspiderQuery={medianSmartspiderQuery}
            width={cardWidth}
            dragTime={dragTime}
            onDetail={() => {
              onDetail(card)
            }}
            onSlide={setSlide}
            group={card.group || group}
            contextGroup={group}
          />
        )}
        <div
          {...styles.swipeIndicator}
          {...styles.swipeIndicatorLeft}
          style={{
            opacity: dir < 0 ? Math.abs(dir) : 0,
            right: card.payload ? undefined : 30,
          }}
        >
          {t(card.payload ? 'components/Card/ignore' : 'components/Card/no')}
        </div>
        <div
          {...styles.swipeIndicator}
          {...styles.swipeIndicatorRight}
          style={{
            opacity: dir > 0 ? Math.abs(dir) : 0,
            left: card.payload ? undefined : 30,
          }}
        >
          {t(card.payload ? 'components/Card/follow' : 'components/Card/yes')}
        </div>
      </animated.div>
    </animated.div>
  )
}

const nNew = 5
const nOld = 3
const Group = ({
  t,
  group,
  fetchMore,
  me,
  subToUser,
  unsubFromUser,
  variables,
  mySmartspider,
  medianSmartspider,
  subscribedByMeCards,
}) => {
  const router = useRouter()
  const { query } = router
  const topFromQuery = useRef(query.top)
  const trialCard = useRef(!me && { id: 'trial' })
  const storageKey = `republik-card-group-${group.slug}`
  const useSwipeState = useMemo(
    () => createPersistedState(storageKey),
    [storageKey],
  )

  const [queue, addToQueue, clearPending, replaceStatePerUserId] = useQueue({
    me,
    subToUser,
    unsubFromUser,
  })

  const totalCount = group.cards.totalCount
  const allTotalCount = group.all.totalCount
  const [allSwipes, setSwipes, isPersisted] = useSwipeState([])
  const swipedMap = useMemo(() => {
    return new Map(allSwipes.map((swipe) => [swipe.cardId, swipe]))
  }, [allSwipes])
  const rightSwipes = allSwipes.filter(
    (swipe) => swipe.dir === 1 && swipe.cardCache,
  )
  const swipedLength = group.special
    ? allSwipes.filter((s) => !s.remote).length
    : allSwipes.length
  const allRealCards = allSwipes.filter((swipe) => swipe.cardCache)

  useEffect(() => {
    if (!subscribedByMeCards || !me) {
      if (Object.keys(queue.statePerUserId).length) {
        replaceStatePerUserId({})
      }
      return
    }
    const rmLocalSwipes = rightSwipes.filter(
      (swipe) =>
        swipe.remote && !subscribedByMeCards.find((c) => c.id === swipe.cardId),
    )
    const newRemoteSwipes = subscribedByMeCards
      .filter((card) => {
        const swipe = swipedMap.get(card.id)
        if (swipe) {
          if (swipe.dir === 1) {
            return false
          }
          rmLocalSwipes.push(swipe)
        }
        return true
      })
      .map((card) => {
        const swipe = {
          dir: 1,
          xDelta: 0,
          velocity: 0.2,
          cardId: card.id,
          cardCache: card,
          date: card.user.subscribedByMe.createdAt,
          remote: true,
        }
        return swipe
      })
    setSwipes((swipes) =>
      swipes
        .filter((swipe) => rmLocalSwipes.indexOf(swipe) === -1)
        .concat(newRemoteSwipes),
    )
    replaceStatePerUserId(
      subscribedByMeCards.reduce((state, card) => {
        state[card.user.id] = { id: card.user.subscribedByMe.id }
        return state
      }, {}),
    )
  }, [subscribedByMeCards])

  const allCards = [
    ...group.cards.nodes.slice(0, 13),
    trialCard.current,
    ...group.cards.nodes.slice(13),
  ].filter(Boolean)

  if (!group.special) {
    allCards.sort((a, b) => {
      const aSwipe = swipedMap.get(a.id)
      const bSwipe = swipedMap.get(b.id)
      return aSwipe && bSwipe
        ? ascending(allSwipes.indexOf(aSwipe), allSwipes.indexOf(bSwipe))
        : ascending(!aSwipe, !bSwipe) ||
            ascending(allCards.indexOf(a), allCards.indexOf(b))
    })
  }

  const getUnswipedIndex = () => {
    const firstUnswipedIndex = allCards.findIndex((card) => {
      if (topFromQuery.current === card.id) {
        return true
      }
      const swipe = swipedMap.get(card.id)
      return !swipe || (group.special && swipe.remote)
    })
    return firstUnswipedIndex === -1 ? allCards.length : firstUnswipedIndex
  }
  const topIndex = getUnswipedIndex()

  const [dragDir, setDragDir] = useState(false)
  const [detailCard, setDetailCard] = useState()
  const [showOverlay, setOverlay] = useState(false)

  // request more
  // ToDo: loading & error state
  useEffect(() => {
    if (topIndex >= allCards.length - 5 && group.cards.pageInfo.hasNextPage) {
      fetchMore(group.cards.pageInfo)
    }
  }, [topIndex, allCards.length, group.cards.pageInfo.hasNextPage])

  const activeCard = allCards[topIndex]

  const [windowWidth, windowHeight] = useWindowSize()
  const cardWidth =
    windowWidth > 500 ? 320 : windowWidth >= MEDIUM_MIN_WIDTH ? 300 : 240

  const fallInBudget = useRef(nNew)
  const dragTime = useRef(0)
  const onCard = useRef(false)

  useEffect(() => {
    const onTouchMove = (event) => {
      if (onCard.current) {
        event.preventDefault()
      }
    }
    window.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const onSwipe = (swiped, card) => {
    if (topFromQuery.current) {
      topFromQuery.current = null
    }
    if (swiped.dir === 1 && card.id === 'trial') {
      setOverlay('trial')
    }
    if (card && card.user) {
      addToQueue(card.user.id, swiped.dir === 1)
    }
    setSwipes((swipes) => {
      const newRecord = {
        ...swiped,
        cardCache: card.payload ? card : undefined,
        date: new Date().toISOString(),
      }
      return swipes
        .filter((swipe) => swipe.cardId !== swiped.cardId)
        .concat(newRecord)
    })
  }
  const revertCard = (card) => {
    const swiped = swipedMap.get(card.id)

    if (card && card.user) {
      addToQueue(card.user.id, false)
    }
    setSwipes((swipes) => {
      return swipes.filter((swipe) => swipe !== swiped)
    })
  }
  let prevCard = allCards[topIndex - 1]
  if (
    prevCard &&
    swipedLength &&
    allSwipes[allSwipes.length - 1].cardId !== prevCard.id
  ) {
    prevCard = null
  }

  const onRevert = () => {
    if (!prevCard) {
      return
    }
    revertCard(prevCard)
  }
  const onReset = () => {
    if (topFromQuery.current) {
      topFromQuery.current = null
    }
    clearPending()
    setSwipes((swipes) =>
      swipes
        .filter(
          (swipe) =>
            swipe.cardCache && queue.statePerUserId[swipe.cardCache.user.id],
        )
        .map((swipe) => {
          swipe.remote = true
          return swipe
        }),
    )
  }
  const followCard = (card) => {
    onSwipe({ dir: 1, xDelta: 0, velocity: 0.2, cardId: card.id }, card)
  }
  const onRight = (e) => {
    if (!activeCard) {
      return
    }
    e.preventDefault()
    followCard(activeCard)
  }
  const ignoreCard = (card) => {
    onSwipe({ dir: -1, xDelta: 0, velocity: 0.2, cardId: card.id }, card)
  }
  const onLeft = (e) => {
    if (!activeCard) {
      return
    }
    e.preventDefault()
    ignoreCard(activeCard)
  }

  const bindGestures = useGesture(
    ({
      first,
      last,
      time,
      args: [set, card, isTop, index],
      down,
      delta: [xDelta],
      distance,
      direction: [xDir],
      velocity,
    }) => {
      if (first) {
        dragTime.current = time
        onCard.current = true
      }
      if (last) {
        dragTime.current = time - dragTime.current
        onCard.current = false
      }

      const out = Math.abs(xDelta) > cardWidth * 0.4
      const trigger = velocity > 0.4 || out
      const dir = out ? (xDelta < 0 ? -1 : 1) : xDir < 0 ? -1 : 1

      if (!down && trigger) {
        onSwipe({ dir, xDelta, velocity, cardId: card.id }, card)
        setDragDir(false)
        return
      }

      const newDragDir =
        (trigger && down && dir) ||
        (down && Math.abs(xDelta) > 10
          ? (Math.abs(xDelta) / (cardWidth * 0.4)) * 0.5 * (xDelta < 0 ? -1 : 1)
          : false)
      if (newDragDir !== dragDir) {
        setDragDir(newDragDir)
      }

      const x = down ? xDelta : 0
      const rot = down ? xDelta / 100 : 0
      const scale = down || isTop ? 1.05 : 1

      set({
        x,
        rot,
        scale,
        delay: undefined,
        config: {
          friction: 50,
          tension: down ? 800 : 500,
        },
      })
    },
  )

  const Flag = Cantons[group.slug] || null

  const medianSmartspiderQuery = medianSmartspider && { party: query.party }

  const onShowMyList = (event) => {
    event.preventDefault()
    router.replace({
      pathname: '/wahltindaer/[group]/[suffix]',
      query: {
        group: group.slug,
        suffix: 'liste',
        ...medianSmartspiderQuery,
      },
    })
  }
  const onDetail = (card) => {
    setDetailCard(card)
  }
  const closeOverlay = (event) => {
    if (event) {
      event.preventDefault()
    }
    if (detailCard) {
      setDetailCard()
    }
    router.replace(
      {
        pathname: '/wahltindaer/[group]',
        query: {
          group: group.slug,
          ...medianSmartspiderQuery,
        },
      },
      undefined,
      { shallow: router.pathname === '/wahltindaer/[group]' },
    )
    setOverlay(false)
  }

  const onPreferenceClick = (e) => {
    e.preventDefault()
    setOverlay('preferences')
  }

  const showMyList = query.suffix?.[0] === 'liste'
  const showDiscussion = query.suffix?.[0] === 'diskussion'
  const showDetail = !!detailCard

  return (
    <Container
      style={{
        minHeight: cardWidth * 1.4 + 60,
        zIndex: ZINDEX_HEADER + 1,
        overflow:
          showMyList || showDiscussion || showDetail || showOverlay
            ? 'visible'
            : undefined,
      }}
    >
      <div
        {...styles.switch}
        style={{
          zIndex: ZINDEX_HEADER + allCards.length + 1,
        }}
      >
        <Link
          href={{
            pathname: '/wahltindaer',
            query: medianSmartspiderQuery,
          }}
          passHref
          legacyBehavior
        >
          <Editorial.A>
            {t(
              `components/Card/Group/switch${group.special ? '/special' : ''}`,
            )}
          </Editorial.A>
        </Link>
      </div>
      <div {...styles.canton}>
        {!!Flag && <Flag size={40} />}
        <strong>
          {t(
            `components/Card/Group/${
              group.name.length > 10 ? 'labelShort' : 'label'
            }`,
            {
              groupName: group.name,
            },
          )}
        </strong>
        <br />
        {!!windowWidth &&
          t('components/Card/Group/sequence', {
            swipes: swipedLength,
            total: allTotalCount,
          })}
      </div>
      {!!windowWidth && (
        <>
          <div {...styles.bottom}>
            {!isPersisted && <>{t('components/Card/Group/noLocalStorage')}</>}
            <br />
            {swipedLength >= allTotalCount ? (
              <>
                <br />
                {t.first(
                  [
                    `components/Card/Group/end/done/${group.slug}`,
                    'components/Card/Group/end/done',
                  ],
                  { groupName: group.name },
                )}
                <br />
                <br />
                <Link
                  href={{
                    pathname: '/wahltindaer/[group]/[suffix]',
                    query: {
                      group: group.slug,
                      suffix: 'liste',
                    },
                  }}
                  passHref
                  legacyBehavior
                >
                  <Editorial.A>
                    {t('components/Card/Group/end/showList')}
                  </Editorial.A>
                </Link>
              </>
            ) : (
              !activeCard &&
              allCards.length >= totalCount && (
                <>
                  <br />
                  {t.first(
                    [
                      `components/Card/Group/end/doneFilterCount/${group.slug}/${totalCount}`,
                      `components/Card/Group/end/doneFilterCount/${group.slug}/other`,
                      `components/Card/Group/end/doneFilterCount/${totalCount}`,
                      'components/Card/Group/end/doneFilterCount/other',
                    ],
                    {
                      groupName: group.name,
                      count: totalCount,
                    },
                  )}
                  <br />
                  <br />
                  <Editorial.A href='#' onClick={onPreferenceClick}>
                    {t('components/Card/Group/end/showPreferences')}
                  </Editorial.A>
                  <br />
                  <br />
                  <Link
                    href={{
                      pathname: '/wahltindaer/[group]/[suffix]',
                      query: {
                        group: group.slug,
                        suffix: 'liste',
                      },
                    }}
                    passHref
                    legacyBehavior
                  >
                    <Editorial.A>
                      {t('components/Card/Group/end/showList')}
                    </Editorial.A>
                  </Link>
                </>
              )
            )}
          </div>
          {allCards.map((card, i) => {
            if (i + nOld < topIndex || i - nNew >= topIndex) {
              return null
            }
            const isTop = topIndex === i

            const swipe = swipedMap.get(card.id)
            let swiped = swipe
            if (
              topFromQuery.current === card.id ||
              (group.special && swiped && swiped.remote)
            ) {
              swiped = false
            }
            let fallIn = false
            if (fallInBudget.current > 0 && !swiped) {
              fallIn = fallInBudget.current
              fallInBudget.current -= 1
            }

            return (
              <SpringCard
                key={card.id}
                index={i}
                t={t}
                card={card}
                swiped={swiped}
                dragTime={dragTime}
                windowWidth={windowWidth}
                cardWidth={cardWidth}
                fallIn={fallIn}
                isHot={isTop || fallIn || Math.abs(topIndex - i) === 1}
                isTop={isTop}
                indicateDir={isTop && dragDir}
                zIndex={ZINDEX_HEADER + allCards.length - i}
                bindGestures={bindGestures}
                onDetail={onDetail}
                group={group}
                mySmartspider={mySmartspider}
                medianSmartspiderQuery={medianSmartspiderQuery}
              />
            )
          })}

          <div
            {...styles.buttonPanel}
            style={{
              zIndex: ZINDEX_HEADER + allCards.length + 1,
            }}
          >
            <button
              {...styles.button}
              {...styles.buttonSmall}
              style={{
                backgroundColor: prevCard ? cardColors.revert : '#B7C1BD',
              }}
              title={t('components/Card/Group/revert')}
              onClick={onRevert}
            >
              <IconRevert />
            </button>
            <button
              {...styles.button}
              {...styles.buttonBig}
              style={{
                backgroundColor: cardColors.left,
              }}
              title={t('components/Card/Group/ignore')}
              onClick={onLeft}
            >
              <IgnoreIcon />
            </button>
            <button
              {...styles.button}
              {...styles.buttonBig}
              style={{
                backgroundColor: cardColors.right,
              }}
              title={t('components/Card/Group/follow')}
              onClick={onRight}
            >
              <IconFollow />
            </button>
            <a
              {...styles.button}
              {...styles.buttonSmall}
              style={{
                backgroundColor: rightSwipes.length ? '#4B6359' : '#B7C1BD',
                fontSize: rightSwipes.length > 99 ? 12 : 16,
              }}
              title={t('components/Card/Group/overview')}
              onClick={onShowMyList}
            >
              {rightSwipes.length || <IconList />}
            </a>
            <br />
            <Editorial.A
              href='#'
              onClick={onPreferenceClick}
              style={{
                display: 'inline-block',
                padding: '5px 0',
                textDecoration: 'none',
                backgroundColor:
                  windowHeight < 500 ? 'rgba(222,239,245,0.5)' : 'none',
              }}
            >
              <IconFilterList
                style={{
                  verticalAlign: 'top',
                  marginRight: 5,
                }}
              />
              {(variables.mustHave && variables.mustHave.length) ||
              variables.smartspider ||
              variables.elected
                ? `${totalCount} ${[
                    variables.elected &&
                      t('components/Card/Group/preferences/elected'),
                    variables.mustHave &&
                      variables.mustHave.length &&
                      t('components/Card/Group/preferences/filter', {
                        filters: variables.mustHave
                          .map((key) =>
                            t(
                              `components/Card/Group/preferences/filter/${key}`,
                            ),
                          )
                          .join(' und '),
                      }),
                    variables.smartspider &&
                      (medianSmartspider
                        ? t('components/Card/Group/preferences/partySort', {
                            party:
                              medianSmartspider.label ||
                              medianSmartspider.value,
                          })
                        : t('components/Card/Group/preferences/mySort')),
                  ]
                    .filter(Boolean)
                    .join(', ')}`
                : t('components/Card/Group/preferences/none')}
            </Editorial.A>
          </div>
        </>
      )}
      <div
        style={{
          position: 'absolute',
          opacity: windowWidth ? 1 : 0,
          zIndex: ZINDEX_HEADER + allCards.length + 1,
        }}
      >
        {showOverlay === 'trial' && (
          <Overlay title={'Probelesen'} onClose={closeOverlay}>
            <TrialForm redirect />
          </Overlay>
        )}
        {showOverlay === 'preferences' && (
          <Overlay
            title={t('components/Card/Group/preferences')}
            onClose={closeOverlay}
          >
            <Preferences
              forcedVariables={group.forcedVariables}
              party={medianSmartspiderQuery && medianSmartspiderQuery.party}
              onParty={(party) => {
                router.replace(
                  {
                    pathname: '/wahltindaer/[group]',
                    query: {
                      group: group.slug,
                      ...(party && { party }),
                    },
                  },
                  undefined,
                  { shallow: router.pathname === '/wahltindaer/[group]' },
                )
              }}
            />
          </Overlay>
        )}
        {showMyList && (
          <Overlay
            title={t('components/Card/Group/title', {
              groupName: group.name,
            })}
            onClose={closeOverlay}
          >
            <MyList
              t={t}
              me={me}
              swipes={allSwipes}
              cardIds={allRealCards.map((swipe) => swipe.cardId)}
              first={allRealCards.length}
              onReset={onReset}
              revertCard={revertCard}
              followCard={followCard}
              ignoreCard={ignoreCard}
              queue={queue}
              isPersisted={isPersisted}
              onClose={closeOverlay}
              isStale={query.stale}
            />
          </Overlay>
        )}
        {showDiscussion && (
          <Overlay
            title={
              (group.discussion && group.discussion.title) ||
              t('components/Card/Group/discussion/title', {
                groupName: query.discussion ? '' : group.name,
              })
            }
            onClose={closeOverlay}
          >
            <Label style={{ display: 'block', marginBottom: 10 }}>
              <RawHtml
                dangerouslySetInnerHTML={{
                  __html: t('components/Card/Group/discussion/lead/closed'),
                }}
              />
            </Label>
            {group.discussion || query.discussion ? (
              <DiscussionContextProvider
                discussionId={query.discussion || group.discussion.id}
              >
                <Discussion />
              </DiscussionContextProvider>
            ) : (
              <Interaction.P>
                {t('components/Card/Group/noDiscussion')}
              </Interaction.P>
            )}
          </Overlay>
        )}
        {showDetail && (
          <Overlay title={detailCard.user.name} onClose={closeOverlay}>
            <Details card={detailCard} mySmartspider={mySmartspider} />
          </Overlay>
        )}
      </div>
    </Container>
  )
}

const subscribeMutation = gql`
  mutation subToUser($userId: ID!) {
    subscribe(objectId: $userId, type: User) {
      id
    }
  }
`
const unsubeMutation = gql`
  mutation unsubFromUser($subscriptionId: ID!) {
    unsubscribe(subscriptionId: $subscriptionId) {
      id
    }
  }
`

export default compose(
  withT,
  withMe,
  graphql(subscribeMutation, {
    props: ({ mutate }) => ({
      subToUser: (variables) =>
        mutate({
          variables,
        }),
    }),
  }),
  graphql(unsubeMutation, {
    props: ({ mutate }) => ({
      unsubFromUser: (variables) =>
        mutate({
          variables,
        }),
    }),
  }),
)(Group)
