import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, graphql } from 'react-apollo'
import { meQuery } from '../../lib/withMe'
import { css } from 'glamor'

import withT from '../../lib/withT'

import ErrorMessage from '../ErrorMessage'

import { SUPPORTED_TOKEN_TYPES } from '../constants'

import EmailTokenIcon from 'react-icons/lib/md/mail-outline'
import AppTokenIcon from 'react-icons/lib/md/phonelink'

import { Interaction, Label, linkRule, RawHtml } from '@project-r/styleguide'

const { H3, P } = Interaction

const Icons = {
  EMAIL_TOKEN: EmailTokenIcon,
  APP: AppTokenIcon
}

const styles = {
  group: css({
    marginTop: '.5em'
  }),
  hint: css({
    marginTop: '.2em',
    lineHeight: '1em'
  })
}

class Poller extends Component {
  constructor(props) {
    super(props)
    const now = new Date().getTime()
    this.state = {
      now,
      start: now
    }
    this.tick = () => {
      clearTimeout(this.tickTimeout)
      this.tickTimeout = setTimeout(() => {
        this.setState(() => ({
          now: new Date().getTime()
        }))
        this.tick()
      }, 1000)
    }
  }
  componentDidMount() {
    this.props.data.startPolling(1000)
    this.tick()
    this.setState({ cookiesDisabled: !navigator.cookieEnabled })
  }
  componentDidUpdate() {
    const {
      data: { me },
      onSuccess
    } = this.props
    if (me) {
      clearTimeout(this.tickTimeout)
      const elapsedMs = this.state.now - this.state.start
      this.props.data.stopPolling()

      onSuccess && onSuccess(me, elapsedMs)
    }
  }
  componentWillUnmount() {
    clearTimeout(this.tickTimeout)
  }
  render() {
    const {
      data: { error, me },
      t
    } = this.props
    if (me) {
      return null
    }

    if (error) {
      return <ErrorMessage error={error} />
    }

    if (this.state.cookiesDisabled) {
      return (
        <Fragment>
          <ErrorMessage error={t('cookies/disabled/error')} />
          <RawHtml
            type={Interaction.P}
            dangerouslySetInnerHTML={{
              __html: t('cookies/disabled/error/explanation')
            }}
          />
        </Fragment>
      )
    }

    const {
      tokenType,
      email,
      onCancel,
      phrase,
      alternativeFirstFactors,
      onTokenTypeChange
    } = this.props

    const { showPhraseHint } = this.state

    const Icon = Icons[tokenType]

    return (
      <Fragment>
        <H3>
          {!!Icon && (
            <Icon
              fill='inherit'
              size='1.2em'
              style={{
                verticalAlign: 'baseline',
                marginRight: 6,
                marginBottom: '-0.2em'
              }}
            />
          )}
          {t(`signIn/polling/${tokenType}/title`)}
        </H3>
        <RawHtml
          type={P}
          {...styles.group}
          dangerouslySetInnerHTML={{
            __html: t(`signIn/polling/${tokenType}/text`)
          }}
        />
        {!!onTokenTypeChange &&
          alternativeFirstFactors.map(altTokenType => (
            <P key={altTokenType} {...styles.group}>
              <Label>
                <a
                  {...linkRule}
                  href='#'
                  onClick={e => {
                    e.preventDefault()
                    onTokenTypeChange(altTokenType)
                  }}
                >
                  {t(`signIn/polling/switch/${altTokenType}`)}
                </a>
              </Label>
            </P>
          ))}
        <P {...styles.group}>
          <Label>{t('signIn/polling/email')}</Label>
          <br />
          {email}
          <br />
          {!!onCancel && (
            <Label>
              <a
                {...linkRule}
                href='#'
                onClick={e => {
                  e.preventDefault()
                  onCancel()
                }}
              >
                {t('signIn/polling/cancel')}
              </a>
            </Label>
          )}
        </P>
        <P {...styles.group}>
          <Label>{t('signIn/polling/phrase')}</Label>
          <br />
          {phrase}
        </P>
        <P {...styles.hint}>
          {!showPhraseHint && (
            <Label>
              <a
                {...linkRule}
                href='#'
                onClick={e => {
                  e.preventDefault()
                  this.setState({ showPhraseHint: true })
                }}
              >
                {t('signIn/polling/phrase/hint/show')}
              </a>
            </Label>
          )}
          {showPhraseHint && (
            <Label {...styles.hint}>
              {t(`signIn/polling/phrase/${tokenType}/hint`)}
            </Label>
          )}
        </P>
      </Fragment>
    )
  }
}

Poller.propTypes = {
  tokenType: PropTypes.oneOf(SUPPORTED_TOKEN_TYPES).isRequired,
  email: PropTypes.string.isRequired,
  phrase: PropTypes.string.isRequired,
  alternativeFirstFactors: PropTypes.arrayOf(
    PropTypes.oneOf(SUPPORTED_TOKEN_TYPES)
  ).isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  onTokenTypeChange: PropTypes.func
}

Poller.defaultProps = {
  alternativeFirstFactors: []
}

export default compose(
  graphql(meQuery),
  withT
)(Poller)
