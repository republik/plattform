import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { css } from 'glamor'
import debounce from 'lodash/debounce'
import { LazyLoad, createFrontSchema } from '@project-r/styleguide'
import { renderMdast } from '@republik/mdast-react-render'
import Link from 'next/link'

import HrefLink from '../Link/Href'

const SIZES = [
  { minWidth: 0, columns: 3 },
  { minWidth: 570, columns: 4 },
  { minWidth: 690, columns: 5 },
  { minWidth: 810, columns: 6 },
  { minWidth: 930, columns: 7 },
  { minWidth: 1150, columns: 8 },
]

export const GAP = 10
const RENDER_WIDTH = 1175 // Tablet breakpoint width for desktop layout

// TypeScript Interfaces
// Note: More specific types should be generated from GraphQL schema
// For now using minimal interfaces for the teaser data structure
export interface TeaserNode {
  identifier: string
  data: Record<string, any>
  children?: TeaserNode[]
}

export interface Teaser {
  id: string
  contentHash?: string
  nodes: TeaserNode[]
  publishDate?: Date
}

export interface TeaserBlockProps {
  path?: string
  lazy?: boolean
  maxHeight?: number
  maxColumns?: number
  teasers: Teaser[]
  style?: React.CSSProperties
}

const TeaserBlock: React.FC<TeaserBlockProps> = ({
  path,
  lazy,
  maxHeight,
  maxColumns = 4,
  teasers,
  style = {},
}) => {
  const blockRef = useRef<HTMLDivElement>(null)
  const teaserRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [width, setWidth] = useState<number | undefined>(undefined)

  // Create schema for rendering teasers (memoized)
  const schema = useMemo(
    () =>
      createFrontSchema({
        Link: HrefLink,
        t: () => '', // Simple passthrough for translation
      }),
    [],
  )

  // Measure function with debounce
  const measure = useCallback(
    debounce(() => {
      const parent = blockRef.current
      if (!parent) {
        return
      }

      const teaserElements = Array.from(parent.querySelectorAll('[data-teaser]'))
      if (!teaserElements.length) {
        return
      }

      const { width: parentWidth } = parent.getBoundingClientRect()

      teaserElements.forEach((teaser) => {
        const rect = teaser.getBoundingClientRect()

        // Calculate scale for this teaser
        const scale = rect.width / RENDER_WIDTH

        // Apply scale transform to inner container and measure its content
        const innerContainer = teaser.querySelector('[data-teaser-inner]')
        if (innerContainer && scale) {
          const inner = innerContainer as HTMLElement
          inner.style.transform = `scale(${scale})`

          // Get the actual rendered height of the content before scaling
          const contentHeight = inner.scrollHeight

          // Set the outer container's height to the scaled content height
          const scaledHeight = contentHeight * scale
          ;(teaser as HTMLElement).style.height = `${scaledHeight}px`
        }
      })

      if (width !== parentWidth) {
        setWidth(parentWidth)
      }
    }, 33),
    [width],
  )

  // Mount and unmount effects
  useEffect(() => {
    window.addEventListener('resize', measure)
    measure()

    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  // Update effect (similar to componentDidUpdate)
  useEffect(() => {
    measure()
  }, [teasers, measure])

  return (
    <div
      ref={blockRef}
      style={{
        position: 'relative',
      }}
    >
      <LazyLoad
        visible={!lazy}
        consistentPlaceholder
        attributes={{
          ...css({
            ...SIZES.filter((s) => s.columns <= maxColumns).reduce(
              (styles, size) => {
                // SSR approximation
                const minHeight = maxHeight
                  ? 300
                  : (teasers.length / size.columns) * 50
                if (size.minWidth) {
                  styles[
                    `@media only screen and (min-width: ${size.minWidth}px)`
                  ] = {
                    minHeight,
                    columns: `${size.columns} auto`,
                  }
                } else {
                  styles.minHeight = minHeight
                  styles.columns = `${size.columns} auto`
                }
                return styles
              },
              {} as any,
            ),
          }),
        }}
        style={{
          height: maxHeight,
          overflowX: maxHeight ? 'hidden' : undefined,
        }}
      >
        {teasers.map((teaser) => {
          // Get the URL from the first node
          const teaserUrl = teaser.nodes[0]?.data?.url || '#'

          return (
            <div key={teaser.id}>
              <Link href={teaserUrl} prefetch={false} passHref>
                <div
                  ref={(el) => {
                    teaserRefs.current[teaser.id] = el
                    if (el) {
                      // Trigger measure after render
                      measure()
                    }
                  }}
                  style={{
                    position: 'relative',
                    // unbreakable margin
                    // GAP needs to be with an inline-block to prevent
                    // the browser from breaking the margin between columns
                    display: 'inline-block',
                    width: '100%',
                    marginBottom: GAP,
                    overflow: 'hidden',
                    // Height will be set by measure() after scaling
                    minHeight: 100, // Prevent layout shift while measuring
                  }}
                  data-teaser={teaser.id}
                >
                  <div
                    data-teaser-inner
                    style={{
                      width: RENDER_WIDTH,
                      transformOrigin: '0% 0%',
                      transition: 'transform 100ms',
                      pointerEvents: 'none', // Prevent inner links from intercepting clicks
                    }}
                  >
                    {renderMdast(
                      {
                        type: 'root',
                        children:
                          teaser.nodes[0]?.data?.teaserType === 'frontTile'
                            ? [
                                {
                                  type: 'zone',
                                  identifier: 'TEASERGROUP',
                                  data: {
                                    columns: 1,
                                    mobileColumns: 1,
                                  },
                                  children: teaser.nodes,
                                },
                              ]
                            : teaser.nodes,
                      },
                      schema,
                      { MissingNode: ({ children }: any) => children },
                    )}
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </LazyLoad>
    </div>
  )
}

export default TeaserBlock
