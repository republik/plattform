'use client'
import type { ChallengeAcceptedPersonListQueryQuery } from '@app/graphql/gql/graphql'
import { css } from '@app/styled-system/css'
import useResizeObserver from 'use-resize-observer'

import Link from 'next/link'
import { useMemo, useEffect, useRef } from 'react'

import {
  forceCenter,
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  SimulationNodeDatum,
} from 'd3-force'
import { select } from 'd3-selection'
import d3ForceLimit from 'd3-force-limit'
import { useRouter } from 'next/navigation'

const RADIUS_LARGE = 110
const RADIUS_MEDIUM = 75
const RADIUS_SMALL = 40

const RADIUS_LARGE_MAX = 150
const RADIUS_MEDIUM_MAX = 100
const RADIUS_SMALL_MAX = 75

type People = ChallengeAcceptedPersonListQueryQuery['people']
type Person = People[number]
type PersonNode = Person & SimulationNodeDatum & { hovered?: boolean }

const getRadius = (datum: PersonNode, width: number): number => {
  let scaleFactor

  if (width > 768) {
    // Linear scaling for big screens
    scaleFactor = width / 1000
  } else {
    // Exponential scaling for small screens
    scaleFactor = Math.pow(0.9, width / 1000)
  }

  switch (datum.size) {
    case 'large':
      return Math.min(RADIUS_LARGE_MAX, RADIUS_LARGE * scaleFactor)
    case 'medium':
      return Math.min(RADIUS_MEDIUM_MAX, RADIUS_MEDIUM * scaleFactor)
    case 'small':
      return Math.min(RADIUS_SMALL_MAX, RADIUS_SMALL * scaleFactor)
    default:
      return RADIUS_SMALL_MAX
  }
}

const getScaleFactor = (datum: PersonNode): number => {
  switch (datum.size) {
    case 'large':
      return 1.3
    case 'medium':
      return 1.5
    case 'small':
      return 1.8
    default:
      return 1.2
  }
}

const PersonBubbleItem = ({
  person,
  width,
  height,
}: {
  person: Person
  width: number
  height: number
}) => {
  const router = useRouter()

  return (
    <div
      data-person={person.slug}
      // Yes, we don't use a proper <Link> intentionally here, so long-press doesn't open a context menu/link preview on mobile
      // Accessible access to people is done in the list outside of this graphic
      onClick={() => {
        router.push(`/challenge-accepted/person/${person.slug}`)
      }}
      className={css({
        color: 'text',
        textDecoration: 'none',
        position: 'absolute',
        display: 'block',
        cursor: 'pointer',
        // background: 'hotpink',
        borderRadius: 'full',
        touchAction: 'manipulation',
        userSelect: 'none',
        // @ts-expect-error for prefixed value
        WebkitUserSelect: 'none',

        '&:hover': {
          zIndex: 1,
        },
      })}
      style={{
        // @ts-expect-error because of custom property
        '--diameter': `${getRadius(person, width) * 2}px`,
        '--hover-scale-factor': getScaleFactor(person),
        '--hover-name-shift': `${30 * getScaleFactor(person)}px`,
        '--name-opacity': person.size === 'large' ? 1 : 0,
      }}
    >
      <div
        data-person-portrait
        className={css({
          transform: 'scale(1)',
          transformOrigin: 'center',
          transition: 'transform 300ms ease-out',
          backgroundSize: '100%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
          '[data-person]:hover &': {
            transform: 'scale(var(--hover-scale-factor))',
          },
        })}
        style={{
          backgroundImage: `url('${person.portrait.url}')`,
          backgroundSize: 'contain',
          width: getRadius(person, width) * 2 || 0,
          height: getRadius(person, width) * 2 || 0,
        }}
      ></div>
      <div
        className={css({
          textStyle: 'h2Sans',
          position: 'absolute',
          transition: 'all 300ms ease-out',
          transform: 'translate(-50%, 0px)',
          left: '50%',
          top: 'var(--diameter)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: 'var(--name-opacity)',
          '[data-person]:hover &': {
            transform: 'translate(-50%, var(--hover-name-shift))',
            opacity: 1,
          },
        })}
      >
        <span
          className={css({
            background: 'pageBackground',
            px: '4',
            py: '1',
            borderRadius: 'full',
          })}
        >
          {person.name}
        </span>
      </div>
    </div>
  )
}

export const PersonBubbleForce = ({ people }: { people: People }) => {
  const { ref, width, height } = useResizeObserver()
  const forceRef = useRef()

  const simulation = useMemo(() => {
    return forceSimulation<PersonNode>([...people])
  }, [people])

  useEffect(() => {
    if (!forceRef.current || !width || !height) {
      return
    }

    const center = [width / 2, height / 2]

    const heroChartNodes = select(forceRef.current)
      .selectAll<HTMLElement, PersonNode>('[data-person]')
      .data(simulation.nodes(), function (d) {
        // Either the data is already joined, then we return d.slug or we read the slug from [data-person]
        return d ? d.slug : (this as HTMLElement).dataset?.person
      })

    simulation
      .alphaTarget(0.2) // stay hot
      .velocityDecay(0.9) // low friction
      .force('x', forceX(width / 2).strength(0.05 / (width / height)))
      .force('y', forceY(height / 2).strength(0.05 / (height / width)))
      .force(
        'collide',
        forceCollide<PersonNode>((d) => {
          const r =
            d.size === 'large'
              ? getRadius(d, width) + 15
              : getRadius(d, width) + 5
          return r
        }),
      )
      .force('center', forceCenter(center[0], center[1]))
      // .force("charge", forceManyBody().strength(0.1))
      .force(
        'limit',
        d3ForceLimit()
          .x0(RADIUS_MEDIUM)
          .x1(width - RADIUS_MEDIUM)
          .y0(RADIUS_MEDIUM)
          .y1(height - RADIUS_MEDIUM)
          .cushionWidth(RADIUS_MEDIUM)
          .cushionStrength(0.2),
      )

    simulation.on('tick', () => {
      heroChartNodes.style(
        'transform',
        (d) =>
          `translate(${d.x - getRadius(d, width)}px,${
            d.y - getRadius(d, width)
          }px)`,
      )
    })

    heroChartNodes.on('pointerenter', (event, d) => {
      d.fx = d.x
      d.fy = d.y
      d.hovered = true

      simulation.force(
        'hovercollide',
        forceCollide<PersonNode>((d) => {
          return d.hovered
            ? getRadius(d, width) * getScaleFactor(d) + 10
            : getRadius(d, width)
        }).strength(0.5),
      )
    })

    heroChartNodes.on('pointerout', (event, d) => {
      d.fx = null
      d.fy = null
      d.hovered = false

      simulation.force('hovercollide', null)
    })

    simulation.alpha(1).restart()

    return () => {
      simulation.stop()
      simulation.on('tick', null)
    }
  }, [simulation, width, height])

  return (
    <div
      ref={ref}
      role='presentation'
      className={css({
        position: 'relative',
        width: 'full',
        // Make sure there's enough space at the bottom for scaled bubbles
        pb: '128px',
      })}
    >
      <div
        ref={forceRef}
        style={{
          // Height should be inversely proportional to width (narrow = higher), so bubbles have enough space
          // Unfortunately, no pure CSS way to do this
          height: Math.max(800, 512000 / (width ?? 1)),
        }}
      >
        {people.map((p) => (
          <PersonBubbleItem
            key={p.id}
            person={p}
            width={width ?? 0}
            height={height ?? 0}
          />
        ))}
      </div>
    </div>
  )
}
