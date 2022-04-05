import { Component } from 'react'
import { css } from 'glamor'

import TeaserNodes from './TeaserNodes'
import { renderWidth, getImgSrc } from './utils'

import { ZINDEX_POPOVER } from '../constants'
import withInNativeApp from '../../lib/withInNativeApp'

const styles = {
  preview: css({
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    imageRendering: 'smooth',
  }),
  big: css({
    position: 'relative',
    width: '100%',
    height: '100%',
    transition: 'opacity 200ms',
  }),
}

class TeaserHover extends Component {
  constructor(props) {
    super(props)

    this.state = { loading: true }
  }
  componentWillUnmount() {
    window.cancelAnimationFrame(this.loadEndRaf)
  }
  render() {
    const {
      path = '/',
      measurement,
      teaser,
      contextWidth,
      highlight,
      inNativeApp,
    } = this.props
    const { loading } = this.state

    const hoverWidth =
      typeof window !== 'undefined' && window.innerWidth > 420 ? 400 : 300
    const onLoadEnd = () => {
      this.loadEndRaf = window.requestAnimationFrame(() => {
        this.setState({ loading: false })
      })
    }
    const ratio = measurement.height / measurement.width
    const scale = hoverWidth / renderWidth
    return (
      <div
        style={{
          position: 'absolute',
          zIndex: ZINDEX_POPOVER,
          top: measurement.y - 5,
          left:
            measurement.x > hoverWidth / 2
              ? measurement.x + measurement.width / 2 + hoverWidth / 2 >
                contextWidth
                ? contextWidth - hoverWidth
                : measurement.x + measurement.width / 2 - hoverWidth / 2
              : 0,
        }}
      >
        <div
          style={{
            width: hoverWidth,
            position: 'absolute',
            bottom: 0,
            height: Math.ceil(hoverWidth * ratio - 5),
            lineHeight: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,.4)',
          }}
        >
          <div
            {...css({
              position: 'absolute',
              top: 0,
              width: renderWidth,
              height: Math.ceil(renderWidth * ratio - 5 / scale),
              overflow: 'hidden',
              transform: `scale(${hoverWidth / renderWidth})`,
              transformOrigin: '0% 0%',
            })}
          >
            <img {...styles.preview} src={getImgSrc(teaser, path)} />
            {/* avoid iframe of own domain in app
             * - it would trigger a navigation to the iframe src
             */}
            {inNativeApp ? (
              <img {...styles.big} src={getImgSrc(teaser, path, 800)} />
            ) : (
              <iframe
                frameBorder='0'
                scrolling='no'
                sandbox=''
                onLoad={onLoadEnd}
                onError={onLoadEnd}
                src={`${path}?extractId=${teaser.id}`}
                {...styles.big}
                style={{
                  opacity: loading ? 0 : 1,
                }}
              />
            )}
            <TeaserNodes nodes={teaser.nodes} highlight={highlight} />
          </div>
        </div>
      </div>
    )
  }
}

export default withInNativeApp(TeaserHover)
