import { Component } from 'react'
import { css } from 'glamor'
import { renderMdast } from '@republik/mdast-react-render'

import { ZINDEX_POPOVER } from '../constants'
import withInNativeApp from '../../lib/withInNativeApp'

const RENDER_WIDTH = 1175 // Same as TeaserBlock

const styles = {
  rendered: css({
    position: 'relative',
    width: '100%',
    height: '100%',
  }),
}

class TeaserHover extends Component {
  render() {
    const {
      path = '/',
      measurement,
      teaser,
      contextWidth,
      highlight,
      inNativeApp,
      schema,
    } = this.props

    const hoverWidth =
      typeof window !== 'undefined' && window.innerWidth > 420 ? 400 : 300
    const ratio = measurement.height / measurement.width
    const scale = hoverWidth / RENDER_WIDTH
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
              width: RENDER_WIDTH,
              height: Math.ceil(RENDER_WIDTH * ratio - 5 / scale),
              overflow: 'hidden',
              transform: `scale(${hoverWidth / RENDER_WIDTH})`,
              transformOrigin: '0% 0%',
            })}
          >
            <div {...styles.rendered}>
              {schema && renderMdast(
                {
                  type: 'root',
                  children: teaser.nodes,
                },
                schema,
                { MissingNode: ({ children }) => children }
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withInNativeApp(TeaserHover)
