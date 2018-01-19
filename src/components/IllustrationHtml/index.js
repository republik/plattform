import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  ai2html: css({
    '& [data-min-width]': {
      display: 'none'
    },
    '& [data-min-width]:last-child': {
      display: 'block'
    }
  })
}

const escapeRegExp = string =>
  string.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&")

class IllustrationHtml extends Component {
  constructor (...args) {
    super(...args)

    this.setRef = ref => {
      this.ref = ref
    }
    this.resize = () => {
      if (this.ref) {
        // ai2html specific resize
        // - adapted from https://github.com/newsdev/ai2html/blob/b0bfda26aba31c5bf9d44c70dba02d4eec381ad6/_includes/resizer-script.html#L9
        const width = this.ref.getBoundingClientRect().width
        const elements = Array.prototype.slice.call(
          this.ref.querySelectorAll('[data-min-width]')
        )
        elements.forEach(element => {
          const minwidth = element.getAttribute('data-min-width')
          const maxwidth = element.getAttribute('data-max-width')
          if (+minwidth <= width && (+maxwidth >= width || maxwidth === null)) {
            element.style.display = 'block'
          } else {
            element.style.display = 'none'
          }
        })
      }
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.resize)
    this.resize()
  }
  componentDidUpdate () {
    this.resize()
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.resize)
  }
  render () {
    const { code, images } = this.props

    let resolvedCode = code
    images.forEach(image => {
      resolvedCode = resolvedCode.replace(
        new RegExp(escapeRegExp(image.ref), 'g'),
        image.url
      )
    })
    return <div
      {...styles.ai2html}
      ref={this.setRef}
      dangerouslySetInnerHTML={{
        __html: resolvedCode
      }}
    />
  }
}


IllustrationHtml.propTypes = {
  code: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    ref: PropTypes.string.isRequired
  })).isRequired
}

export default IllustrationHtml
