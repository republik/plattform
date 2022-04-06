import { Component } from 'react'
import { css } from 'glamor'

import withT from '../../lib/withT'

import FieldSet from '../FieldSet'

import { fontFamilies, mediaQueries, inQuotes } from '@project-r/styleguide'

const styles = {
  quote: {
    fontFamily: fontFamilies.serifTitle,
    lineHeight: 1.2,
  },
}

const fontSizeBoost = (length) => {
  if (length < 40) {
    return 26
  }
  if (length < 50) {
    return 17
  }
  if (length < 80) {
    return 8
  }
  if (length < 100) {
    return 4
  }
  if (length > 200) {
    return -4
  }
  return 0
}

const fields = (t) => [
  {
    label: t('profile/statement/label'),
    name: 'statement',
    autoSize: true,
    validator: (value) =>
      value.trim().length >= 140 && t('profile/statement/tooLong'),
  },
]

class Statement extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      isMobile: true,
    }

    this.handleResize = () => {
      const isMobile = window.innerWidth < mediaQueries.mBreakPoint
      if (isMobile !== this.state.isMobile) {
        this.setState({ isMobile })
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  render() {
    const { t, user, isEditing, ...props } = this.props
    const { isMobile } = this.state
    if (!user.statement && !isEditing) {
      return null
    }
    const fontSize = isMobile
      ? 22
      : 24 + fontSizeBoost((user.statement || '').length)
    return (
      <span {...css(styles.quote)} style={{ fontSize }}>
        {isEditing ? (
          <FieldSet
            {...props}
            dirty={{ ...props.dirty, statement: true }}
            fields={fields(t)}
          />
        ) : (
          inQuotes(user.statement)
        )}
      </span>
    )
  }
}

export default withT(Statement)
