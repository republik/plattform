import { createRef, Component } from 'react'
import { css } from 'glamor'
import debounce from 'lodash/debounce'

import { LazyLoad } from '@project-r/styleguide'

import TeaserHover from './TeaserHover'
import TeaserNodes from './TeaserNodes'
import QueuedImg from './QueuedImg'
import { getImgSrc } from './utils'

const SIZES = [
  { minWidth: 0, columns: 3 },
  { minWidth: 570, columns: 4 },
  { minWidth: 690, columns: 5 },
  { minWidth: 810, columns: 6 },
  { minWidth: 930, columns: 7 },
  { minWidth: 1150, columns: 8 },
]

export const GAP = 10

const styles = {
  container: css({
    display: 'block',
    columnGap: GAP,
    width: '100%',
    lineHeight: 0,
  }),
}

class TeaserBlock extends Component {
  constructor(props, ...args) {
    super(props, ...args)
    this.blockRef = createRef()
    this.state = {}
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

      return {
        id: teaser.getAttribute('data-teaser'),
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
      maxColumns = 6,
      noHover,
      backgroundColor,
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
          ...style,
        }}
      >
        <LazyLoad
          visible={!lazy}
          consistentPlaceholder
          attributes={{
            ...styles.container,
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

            const Image = lazy ? QueuedImg : 'img'

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
                  />
                )}
                <div
                  style={{
                    position: 'relative',
                    // unbreakable margin
                    // GAP needs to be with an inline-block to prevent
                    // the browser from breaking the margin between columns
                    display: 'inline-block',
                  }}
                  data-teaser={teaser.id}
                >
                  <Image
                    onLoad={this.measure}
                    src={getImgSrc(teaser, path)}
                    style={{
                      display: 'block',
                      marginBottom: GAP,
                      width: '100%',
                    }}
                  />
                  <TeaserNodes
                    nodes={teaser.nodes}
                    highlight={highlight}
                    noClick={hover && hover.touch}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            )
          })}
        </LazyLoad>
      </div>
    )
  }
}

export default TeaserBlock
