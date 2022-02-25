import React from 'react'
import PropTypes from 'prop-types'

import CodeAuthorization from './CodeAuthorization'
import AccessTokenAuthorization from './AccessTokenAuthorization'
import Poller from './Poller'

import withT from '../../lib/withT'

import { SUPPORTED_TOKEN_TYPES } from '../constants'

const SWITCH_BOARD_SUPPORTED_TOKEN_TYPES = SUPPORTED_TOKEN_TYPES.concat([
  'EMAIL_CODE',
  'ACCESS_TOKEN',
])

const SwitchBoard = (props) => {
  if (props.tokenType === 'EMAIL_CODE') {
    return <CodeAuthorization {...props} />
  }
  if (props.tokenType === 'ACCESS_TOKEN') {
    return <AccessTokenAuthorization {...props} />
  }

  return <Poller {...props} />
}

SwitchBoard.propTypes = {
  tokenType: PropTypes.oneOf(SWITCH_BOARD_SUPPORTED_TOKEN_TYPES).isRequired,
  email: PropTypes.string.isRequired,
  phrase: PropTypes.string.isRequired,
  alternativeFirstFactors: PropTypes.arrayOf(
    PropTypes.oneOf(SWITCH_BOARD_SUPPORTED_TOKEN_TYPES),
  ).isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  onTokenTypeChange: PropTypes.func,
}

SwitchBoard.defaultProps = {
  alternativeFirstFactors: [],
}

export default withT(SwitchBoard)
