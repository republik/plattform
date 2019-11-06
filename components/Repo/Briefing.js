import React, { Component } from 'react'
import { css } from 'glamor'

import BriefingIcon from 'react-icons/lib/md/work'

import { colors } from '@project-r/styleguide'

const loading = css.keyframes({
  'from, to': {
    opacity: 0.5
  },
  '50%': {
    opacity: 1
  }
})

const styles = {
  processing: css({
    '[data-processing]': {
      animation: `0.4s ${loading} infinite ease-in-out`
    }
  })
}

class Briefing extends Component {
  constructor(...args) {
    super(...args)
    this.state = {}
  }
  render() {
    const { value, onChange } = this.props
    return (
      <a
        {...styles.processing}
        href={value}
        data-processing={this.state.editing}
        onClick={e => {
          if (value && !e.altKey) {
            return
          }
          e.preventDefault()
          const next = window.prompt('Briefing URL anpassen:', value || '')
          if (next === null) {
            // cancel
            return
          }
          this.setState({ editing: true })
          const finishEditing = () => this.setState({ editing: undefined })
          onChange(next || null)
            .then(finishEditing)
            .catch(finishEditing)
        }}
      >
        <BriefingIcon color={value ? colors.primary : '#eee'} />
      </a>
    )
  }
}

export default Briefing
