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

const SwitchBoard = ({ alternativeFirstFactors = [], ...props }) => {
  if (props.tokenType === 'EMAIL_CODE') {
    return (
      <CodeAuthorization
        alternativeFirstFactors={alternativeFirstFactors}
        {...props}
      />
    )
  }
  if (props.tokenType === 'ACCESS_TOKEN') {
    return (
      <AccessTokenAuthorization
        alternativeFirstFactors={alternativeFirstFactors}
        {...props}
      />
    )
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

export default withT(SwitchBoard)
