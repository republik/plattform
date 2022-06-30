import { Component } from 'react'
import { ChromePicker } from 'react-color'
import { rgb } from 'd3-color'
import { Label } from '@project-r/styleguide'
import withT from '../../../lib/withT'

const styles = {
  popover: {
    position: 'absolute',
    zIndex: '2',
  },
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
  button: {
    display: 'inline-block',
    width: '30px',
    height: '30px',
    border: '1px solid #000',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 15,
    padding: '7px 6px',
  },
}

// see https://www.w3.org/TR/WCAG20/#relativeluminancedef
const convertDomain = (x) => {
  const xNorm = x / 255
  if (xNorm <= 0.03928) {
    return xNorm / 12.92
  }
  const base = (xNorm + 0.055) / 1.055
  return Math.pow(base, 2.4)
}

const getRelativeLuminance = (color) => {
  const { r, g, b } = rgb(color)
  const r1 = convertDomain(r)
  const g1 = convertDomain(g)
  const b1 = convertDomain(b)
  return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1
}

const getColorContrast = (color1, color2) => {
  const rl1 = getRelativeLuminance(color1)
  const rl2 = getRelativeLuminance(color2)
  const rlmax = rl1 > rl2 ? rl1 : rl2
  const rlmin = rl1 <= rl2 ? rl1 : rl2
  return (rlmax + 0.05) / (rlmin + 0.05)
}

// WCAG 2.0 level AA standard, for large text
// minimum contrast level 3:1
export const ContrastInfo = withT(({ t, color, bgColor }) => {
  if (!color || !bgColor) return null
  const contrast = getColorContrast(color, bgColor)
  const warning = contrast < 3
  return (
    <div style={{ margin: '5px 0' }}>
      {t('colorPicker/contrastInfo/title')}
      <span style={{ marginRight: 10 }}>
        {contrast.toFixed(1)}&thinsp;:&thinsp;1
      </span>
      {warning ? '⚠️' : '✅'}
      {warning && (
        <span style={{ display: 'block' }}>
          <small>{t('colorPicker/contrastInfo/warning')}</small>
        </span>
      )}
    </div>
  )
})

class ColorPicker extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      displayColorPicker: false,
    }
    this.clickHandler = this.clickHandler.bind(this)
    this.closeHandler = this.closeHandler.bind(this)
  }

  clickHandler() {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  }

  closeHandler() {
    this.setState({ displayColorPicker: false })
  }

  render() {
    return (
      <div style={{ marginBottom: 5 }}>
        <Label>{this.props.label}</Label>
        <div>
          <span
            onClick={this.clickHandler}
            style={{
              backgroundColor: this.props.value,
              ...styles.button,
            }}
          >
            {!this.props.value && '❌'}
          </span>
          {!!this.props.value && (
            <span
              onClick={() => {
                this.props.onChange(undefined)
              }}
              style={{
                ...styles.button,
                borderColor: 'transparent',
              }}
            >
              ❌
            </span>
          )}
        </div>
        {this.state.displayColorPicker && (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={this.closeHandler} />
            <ChromePicker
              color={this.props.value || '#7C7070'}
              onChange={(value) => {
                this.props.onChange(value.hex)
              }}
            />
          </div>
        )}
      </div>
    )
  }
}

export default ColorPicker
