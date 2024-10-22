import React, { Component } from "react";
import { css } from "glamor";


const styles = {
  ai2html: css({
    '& [data-min-width]': {
      display: 'none',
    },
    '& [data-min-width]:last-child': {
      display: 'block',
    },
  }),
}

class Datawrapper extends Component {
  constructor(...args) {
    super(...args)

    this.setRef = (ref) => {
      this.ref = ref
    }
    this.resize = () => {
      if (this.ref) {
        // ai2html specific resize
        // - adapted from https://github.com/newsdev/ai2html/blob/b0bfda26aba31c5bf9d44c70dba02d4eec381ad6/_includes/resizer-script.html#L9
        const width = this.ref.getBoundingClientRect().width
        const elements = Array.prototype.slice.call(
          this.ref.querySelectorAll('[data-min-width]'),
        )
        elements.forEach((element) => {
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
  componentDidMount() {
    window.addEventListener('resize', this.resize)
    this.resize()
  }
  componentDidUpdate() {
    this.resize()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }
  render() {
    const { datawrapperId, alt } = this.props

    if (!datawrapperId) {
      return <p>No Datawrapper ID</p>
    }

    const html = `<div style="min-height:496px" id="datawrapper-vis-${datawrapperId}">
      <script 
        type="text/javascript" 
        defer 
        src="https://datawrapper.dwcdn.net/${datawrapperId}/embed.js" 
        charset="utf-8"
        data-target="#datawrapper-vis-${datawrapperId}">
      </script>
      <noscript>
        <img src="https://datawrapper.dwcdn.net/${datawrapperId}/full.png" alt="${alt}" />
      </noscript>
    </div>`

    return (
      <div
        {...styles.ai2html}
        ref={this.setRef}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    )
  }
}

export default Datawrapper
