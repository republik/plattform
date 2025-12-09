import { createRef, Component } from 'react'
import { css } from 'glamor'
import debounce from 'lodash/debounce'

import { LazyLoad, createFrontSchema } from '@project-r/styleguide'
import { renderMdast } from '@republik/mdast-react-render'
import Link from 'next/link'

import TeaserHover from './TeaserHover'
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

class TeaserBlock extends Component {
  constructor(props, ...args) {
    super(props, ...args)
    this.blockRef = createRef()
    this.teaserRefs = {}
    this.state = {}

    // Create schema for rendering teasers
    this.schema = createFrontSchema({
      Link: HrefLink,
      AudioPlayButton: undefined,
      t: (key) => key, // Simple passthrough for translation
    })
  }
  measure = debounce(() => {
    const parent = this.blockRef.current
    if (!parent) {
      return
    }

    const teaserElements = Array.from(parent.querySelectorAll('[data-teaser]'))
    if (!teaserElements.length) {
      return
    }

    const { left, top, width } = parent.getBoundingClientRect()

    this.measurements = teaserElements.map((teaser) => {
      const rect = teaser.getBoundingClientRect()

      // Calculate scale for this teaser
      const teaserId = teaser.getAttribute('data-teaser')
      const scale = rect.width / RENDER_WIDTH

      // Apply scale transform to inner container and measure its content
      const innerContainer = teaser.querySelector('[data-teaser-inner]')
      if (innerContainer && scale) {
        innerContainer.style.transform = `scale(${scale})`

        // Get the actual rendered height of the content before scaling
        const contentHeight = innerContainer.scrollHeight

        // Set the outer container's height to the scaled content height
        const scaledHeight = contentHeight * scale
        teaser.style.height = `${scaledHeight}px`
      }

      return {
        id: teaserId,
        x: rect.left - left,
        y: rect.top - top,
        height: rect.height - GAP, // substract unbreakable margin, see below
        width: rect.width,
        left: rect.left,
      }
    })
    if (this.state.width !== width) {
      this.setState({ width })
    }
  }, 33)
  componentDidMount() {
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentDidUpdate() {
    this.measure()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.measure)
    clearTimeout(this.hoverTimeout)
  }
  render() {
    const { hover, width } = this.state
    const {
      path,
      highlight,
      onHighlight,
      lazy,
      maxHeight,
      maxColumns = 4,
      noHover,
      teasers,
      style = {},
    } = this.props

    const hoverOff = () => {
      // prevent flicker
      this.hoverTimeout = setTimeout(() => {
        if (this.state.hover === hover) {
          this.setState({ hover: false })
          onHighlight()
        }
      }, 66)
    }

    return (
      <div
        ref={this.blockRef}
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
                {},
              ),
            }),
          }}
          style={{
            height: maxHeight,
            overflowX: maxHeight ? 'hidden' : undefined,
          }}
        >
          {teasers.map((teaser) => {
            let touch
            const focus = (event) => {
              if (!this.measurements) {
                return
              }
              const measurement = this.measurements.find(
                (m) => m.id === teaser.id,
              )
              if (!measurement) {
                return
              }

              let currentEvent = event
              if (currentEvent.changedTouches) {
                currentEvent = currentEvent.changedTouches[0]
              }

              const x =
                (currentEvent.clientX - measurement.left) / measurement.width
              if (x >= 1) {
                hoverOff()
                return
              }

              this.setState(
                {
                  hover: {
                    touch,
                    teaser,
                    measurement,
                  },
                },
                () => {
                  const index = Math.floor(x * teaser.nodes.length)
                  const activeNode = teaser.nodes[index]
                  const urlMeta = (activeNode && activeNode.data.urlMeta) || {}

                  if (urlMeta.format) {
                    onHighlight(
                      (data) =>
                        data.urlMeta && data.urlMeta.format === urlMeta.format,
                    )
                  } else if (urlMeta.series) {
                    onHighlight(
                      (data) =>
                        data.urlMeta && data.urlMeta.series === urlMeta.series,
                    )
                  } else if (activeNode) {
                    onHighlight((data) => data.id === activeNode.data.id)
                  }
                },
              )
            }

            // Get the URL from the first node
            const teaserUrl = teaser.nodes[0]?.data?.url || '#'
            
            return (
              <div
                key={teaser.id}
                onTouchStart={() => {
                  touch = true
                }}
                onMouseEnter={!noHover ? focus : () => {}}
                onMouseMove={!noHover ? focus : () => {}}
                onMouseLeave={!noHover ? hoverOff : () => {}}
                onClick={() => {
                  touch = undefined
                }}
              >
                {hover && hover.teaser.id === teaser.id && (
                  <TeaserHover
                    {...hover}
                    contextWidth={width}
                    path={path}
                    highlight={highlight}
                    schema={this.schema}
                  />
                )}
                <Link href={teaserUrl} prefetch={false} passHref>
                  <div
                    ref={(el) => {
                      this.teaserRefs[teaser.id] = el
                      if (el) {
                        // Trigger measure after render
                        this.measure()
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
                          children: teaser.nodes[0]?.data?.teaserType === 'frontTile' 
                            ? [
                                {
                                  type: 'zone',
                                  identifier: 'TEASERGROUP',
                                  data: {
                                    columns: 1,
                                    mobileColumns: 1,
                                  },
                                  children: teaser.nodes,
                                }
                              ]
                            : teaser.nodes,
                        },
                        this.schema,
                        { MissingNode: ({ children }) => children },
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
}

export default TeaserBlock
