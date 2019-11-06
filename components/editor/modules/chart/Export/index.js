import React, { Component, Fragment } from 'react'
import { css } from 'glamor'
import { rgb } from 'd3-color'

import { Label, A } from '@project-r/styleguide'

import {
  downloadBlobOnClick,
  downloadPngOnClick,
  getSvgNode,
  getAbstractSvg,
  createSvgBackgrounder,
  DEFAULT_BG
} from './utils'

const textColor = color => {
  const yiq = (color.r * 299 + color.g * 587 + color.b * 114) / 1000
  return yiq >= 128 ? 'black' : 'white'
}

const styles = {
  input: css({
    outline: 'none',
    color: 'black',
    border: '1px solid red',
    font: 'inherit',
    marginRight: -10,
    textAlign: 'center',
    width: 80,
    '::placeholder': {
      color: '#ccc'
    }
  })
}

class Export extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      color: DEFAULT_BG
    }
  }
  render() {
    const { chart } = this.props
    const { color } = this.state
    const rgbColor = rgb(color)
    const backgrounder = createSvgBackgrounder({
      color: rgbColor.displayable() ? color : undefined
    })

    return (
      <Fragment>
        <Label>Export</Label>
        <br />
        <A
          href='#'
          download='chart.svg'
          onClick={downloadBlobOnClick(() => {
            return new window.Blob([getSvgNode(chart).outerHTML], {
              type: 'text/svg'
            })
          })}
        >
          SVG
        </A>
        <br />
        <br />
        <Label>Abstract Teaser</Label>
        <br />
        <A
          href='#'
          download='teaser.svg'
          onClick={downloadBlobOnClick(() => {
            return new window.Blob([getAbstractSvg(chart).svg.outerHTML], {
              type: 'text/svg'
            })
          })}
        >
          SVG
        </A>{' '}
        <A
          href='#'
          download='teaser.png'
          onClick={downloadPngOnClick(() => {
            return getAbstractSvg(chart)
          })}
        >
          PNG
        </A>
        <br />
        <Label>
          mit Hintergrund:{' '}
          <input
            {...styles.input}
            value={color}
            style={
              rgbColor.displayable()
                ? {
                    color: textColor(rgbColor),
                    backgroundColor: color,
                    borderColor: 'transparent'
                  }
                : undefined
            }
            onBlur={e => {
              !rgb(e.target.value).displayable() &&
                this.setState({
                  color: DEFAULT_BG
                })
            }}
            onChange={e => {
              this.setState({ color: e.target.value })
            }}
          />
        </Label>
        <br />
        <A
          href='#'
          download='sm.svg'
          onClick={downloadBlobOnClick(() => {
            return new window.Blob(
              [backgrounder(getAbstractSvg(chart)).svg.outerHTML],
              { type: 'text/svg' }
            )
          })}
        >
          SVG
        </A>{' '}
        <A
          href='#'
          download='sm.png'
          onClick={downloadPngOnClick(() => {
            return backgrounder(getAbstractSvg(chart))
          })}
        >
          PNG
        </A>
      </Fragment>
    )
  }
}

export default Export
