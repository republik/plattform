import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { css, media } from 'glamor'
import debounce from 'lodash/debounce'
import {
  LazyLoad,
  createFrontSchema,
  mediaQueries,
} from '@project-r/styleguide'
import { renderMdast } from '@republik/mdast-react-render'
import Link from 'next/link'

import HrefLink from '../Link/Href'

const SIZES = [
  { minWidth: 0, columns: 1 },
  { minWidth: mediaQueries.mBreakPoint, columns: 2 },
  { minWidth: mediaQueries.lBreakPoint, columns: 3 },
  { minWidth: 1400, columns: 4 },
]

const RENDER_WIDTH = 1175 // Tablet breakpoint width for desktop layout

const teaserHoverStyle = css({
  cursor: 'pointer',
  ':hover': {
    transform: 'scale(1.03)',
    zIndex: 1,
  },
})

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
  maxHeight,
  maxColumns = 4,
  teasers,
}) => {
  const blockRef = useRef<HTMLDivElement>(null)
  const teaserRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [width, setWidth] = useState<number | undefined>(undefined)
  const [isMeasured, setIsMeasured] = useState(false)

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

      const teaserElements = Array.from(
        parent.querySelectorAll('[data-teaser]'),
      )
      if (!teaserElements.length) {
        return
      }

      const { width: parentWidth } = parent.getBoundingClientRect()
      
      // On mobile viewports (< 640px), skip scaling to let teasers render naturally
      const isMobileViewport = window.innerWidth < 640

      teaserElements.forEach((teaser) => {
        const rect = teaser.getBoundingClientRect()

        // Apply scale transform to inner container and measure its content
        const innerContainer = teaser.querySelector('[data-teaser-inner]')
        if (innerContainer) {
          const inner = innerContainer as HTMLElement
          
          if (isMobileViewport) {
            // On mobile: no scaling, natural width
            inner.style.width = '100%'
            inner.style.transform = 'none'
            ;(teaser as HTMLElement).style.height = 'auto'
          } else {
            // On desktop: scale down from RENDER_WIDTH
            inner.style.width = `${RENDER_WIDTH}px`
            const scale = rect.width / RENDER_WIDTH
            inner.style.transform = `scale(${scale})`

            // Get the actual rendered height of the content before scaling
            const contentHeight = inner.scrollHeight

            // Set the outer container's height to the scaled content height
            const scaledHeight = contentHeight * scale
            ;(teaser as HTMLElement).style.height = `${scaledHeight}px`
          }
        }
      })

      if (width !== parentWidth) {
        setWidth(parentWidth)
      }

      // Mark as measured after first layout calculation
      if (!isMeasured) {
        setIsMeasured(true)
      }
    }, 33),
    [width, isMeasured],
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
    <div ref={blockRef} style={{ paddingLeft: 15, paddingRight: 15 }}>
      <LazyLoad
        visible={false}
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
                  {...teaserHoverStyle}
                  ref={(el) => {
                    teaserRefs.current[teaser.id] = el
                    if (el) {
                      // Trigger measure after render
                      measure()
                    }
                  }}
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '100%',
                    marginBottom: 10,
                    overflow: 'hidden',
                    minHeight: 100,
                    opacity: isMeasured ? 1 : 0,
                    transition:
                      'opacity 0.3s ease-in-out, transform 0.2s ease-in-out',
                  }}
                  data-teaser={teaser.id}
                >
                  <div
                    data-teaser-inner
                    style={{
                      width: RENDER_WIDTH,
                      transformOrigin: '0% 0%',
                      transition: 'transform 100ms',
                      pointerEvents: 'none',
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
