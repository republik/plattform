import React, { useEffect, useState, useRef } from 'react'
import { useSprings, animated, interpolate } from 'react-spring/web.cjs'
import { useGesture } from 'react-use-gesture/dist/index.js'
import { css } from 'glamor'
import { t } from '../../../lib/withT'
import { useWindowSize } from '../../../lib/hooks/useWindowSize'
import {
  Interaction,
  mediaQueries,
  usePrevious,
  ColorContextProvider,
} from '@project-r/styleguide'
import { shuffle } from 'd3-array'

const MAX_WIDTH = 800
const PADDING = 15
const CARD_NUMBER = 10

// Based on https://codesandbox.io/s/j0y0vpz59

const styles = {
  root: css({
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: 960,
    [mediaQueries.mUp]: {
      height: 840,
    },
    textAlign: 'center',
    '& > div': {
      position: 'absolute',
      willChange: 'transform',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    '& > div > div': {
      cursor: 'grab',
      '&:active': {
        cursor: 'grabbing',
      },
      backgroundColor: '#fff',
      backgroundSize: 'auto 85%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      width: '85vw',
      willChange: 'transform',
      borderRadius: '5px',
      boxShadow:
        '0 12px 50px -10px rgba(0, 0, 0, 0.4), 0 10px 10px -10px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      padding: '20px 15px 15px 15px',
    },
    '& *': {
      userSelect: 'none',
    },
    '& > div > div > *': {
      pointerEvents: 'none',
    },
  }),
}

const tt = (key) => t(`marketing/cards/${key}`)

const cardWidthDesktop = (innerWidth) =>
  Math.min(Math.max(MAX_WIDTH, innerWidth) / 2, 480)

const xDesktop = (i, innerWidth, cardWidth) =>
  Math.floor(innerWidth / 2) + (i % 2 ? PADDING : -cardWidth + PADDING * 2)

const randomRotation = () => -3 + Math.random() * 6

const toMobile = (i, innerWidth, cardWidth) => ({
  x: 0,
  y: 30 + 50 * i,
  scale: 1,
  rot: randomRotation(),
  delay: i * 100,
})

const toDesktop = (i, innerWidth, cardWidth) => {
  return {
    x: xDesktop(i, innerWidth, cardWidth),
    y: 35 + (i - (i % 2)) * 25,
    scale: 1,
    rot: randomRotation(),
    delay: i * 100,
  }
}

const trans = (r, s) => `rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

const Cards = ({ employees, filter, slice }) => {
  const [width = typeof window !== 'undefined' && window.innerWidth] =
    useWindowSize()
  const prevWidth = usePrevious(width)
  const isDesktop = width >= mediaQueries.mBreakPoint
  const cardWidth = cardWidthDesktop(width)
  const to = isDesktop ? toDesktop : toMobile
  const [gone] = useState(() => new Set())
  const [zIndexes, setZIndexes] = useState([])
  const shuffleCards = (promi = 0) =>
    employees
      .slice(0, promi) // promis get returned first by backend
      .concat(shuffle(employees.slice(promi)))
      .filter((d) => d.user && d.user.portrait)
      .filter(filter)
      .slice(0, CARD_NUMBER)
      .reverse()
  const [cards, setCards] = useState(shuffleCards(4))
  const setTopIndex = (topIndex) => {
    setZIndexes((indexes) => [
      ...indexes.filter((i) => i !== topIndex),
      topIndex,
    ])
  }
  const [props, set] = useSprings(CARD_NUMBER, (i) => ({
    from: { ...to(i, width, cardWidth), x: i % 2 ? width + 1000 : -1000 },
  }))
  const [inView, setInView] = useState(undefined)
  useEffect(() => {
    if (!inView) {
      return
    }

    gone.clear()
    setZIndexes([])
    set((i) => ({
      ...to(i, window.innerWidth, cardWidth),
      ...(prevWidth !== width
        ? {
            delay: undefined,
            config: { friction: 50, tension: 1000 },
          }
        : undefined),
    }))
  }, [width, prevWidth, inView])
  const rootRef = useRef()
  useEffect(() => {
    if (inView) {
      return
    }
    const check = () => {
      if (!rootRef.current) {
        return
      }
      const { top } = rootRef.current.getBoundingClientRect()
      if (top - window.innerHeight < -250) {
        setInView(true)
      }
    }
    window.addEventListener('scroll', check)
    check()
    return () => {
      window.removeEventListener('scroll', check)
    }
  }, [inView])
  const animateCard = (index, { down, xDelta, dir } = {}) => {
    set((i) => {
      if (index !== i) return
      const isGone = gone.has(index)
      const xPos = isDesktop ? xDesktop(i, window.innerWidth, cardWidth) : 0
      const x = isGone
        ? (200 + window.innerWidth) * dir
        : down
        ? xPos + xDelta
        : xPos
      const rot = down || isGone ? 0 : randomRotation()
      const scale = down ? 1.1 : 1 // Active cards lift up a bit
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
      }
    })
  }
  const maybeRestoreCards = () => {
    if (gone.size === CARD_NUMBER) {
      setTimeout(() => {
        gone.clear()
        setZIndexes([])
        setCards(shuffleCards())
        set((i) => to(i, window.innerWidth, cardWidth))
      }, 600)
    }
  }
  const bind = useGesture(
    ({ args: [index], down, delta: [xDelta], direction: [xDir], velocity }) => {
      const trigger =
        (velocity > 0.2 && Math.abs(xDelta) > cardWidth / 8) ||
        Math.abs(xDelta) > cardWidth / 4
      const dir = velocity > 0.2 ? (xDir < 0 ? -1 : 1) : xDelta < 0 ? -1 : 1
      if (!down && trigger && !gone.has(index)) {
        gone.add(index)
      }
      if (down && zIndexes[zIndexes.length - 1] !== index) {
        setTopIndex(index)
      }
      animateCard(index, { down, xDelta, dir })
      if (!down) {
        maybeRestoreCards()
      }
    },
  )

  return (
    <ColorContextProvider colorSchemeKey='light'>
      <div {...styles.root} ref={rootRef}>
        {!!width &&
          cards.length &&
          props.map(({ x, y, rot, scale }, i) => (
            <animated.div
              key={i}
              style={{
                transform: interpolate(
                  [x, y],
                  (x, y) => `translate3d(${x}px,${y}px,0)`,
                ),
                zIndex: zIndexes.indexOf(i) + 1,
                width: isDesktop ? cardWidth - PADDING * 4 : '100%',
              }}
            >
              <animated.div
                {...bind(i)}
                style={{
                  transform: interpolate([rot, scale], trans),
                  maxWidth: isDesktop ? undefined : 350,
                }}
                onDoubleClick={() => {
                  gone.add(i)
                  animateCard(i, { dir: i % 2 ? 1 : -1 })
                  maybeRestoreCards()
                }}
              >
                <Interaction.H3 style={{ marginTop: 5, marginBottom: 0 }}>
                  {cards[i].name}
                </Interaction.H3>
                <Interaction.P style={{ marginBottom: 20 }}>
                  {cards[i].title || cards[i].group}
                </Interaction.P>
                <img
                  alt={cards[i].name}
                  width='100%'
                  src={cards[i].user.portrait}
                />
              </animated.div>
            </animated.div>
          ))}
      </div>
    </ColorContextProvider>
  )
}

export default Cards
