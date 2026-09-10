import withT from '@/lib/withT'
import { Checkbox, RawHtml } from '@project-r/styleguide'
import { ascending } from 'd3-array'
import PropTypes from 'prop-types'

const stringifyCombo = (combo = []) =>
  combo
    .filter(Boolean) // copy and remove empty
    .sort(ascending)
    .join('_')

const check = (required, accepted = []) =>
  required.every((key) => accepted.indexOf(key) !== -1)

export const getConsentsError = (t, required, accepted) =>
  !check(required, accepted) &&
  t(`pledge/consents/error/${stringifyCombo(required)}`)

const Consents = withT(
  ({ t, accepted, onChange, required, disabled, error }) => {
    return (
      <Checkbox
        error={error}
        disabled={disabled}
        checked={check(required, accepted)}
        onChange={(_, checked) => {
          onChange(
            checked
              ? required.filter((key) => VALID_KEYS.indexOf(key) !== -1)
              : [],
          )
        }}
      >
        <RawHtml
          error={error}
          dangerouslySetInnerHTML={{
            __html: t(`pledge/consents/label/${stringifyCombo(required)}`),
          }}
        />
      </Checkbox>
    )
  },
)

const VALID_KEYS = ['PRIVACY', 'STATUTE', 'TOS']
const VALID_COMBOS = ['PRIVACY_STATUTE_TOS', 'PRIVACY_TOS', 'PRIVACY']

Consents.propTypes = {
  onChange: PropTypes.func.isRequired,
  accepted: PropTypes.arrayOf(PropTypes.string.isRequired),
  required: (props, propName, componentName) => {
    if (VALID_COMBOS.indexOf(stringifyCombo(props[propName])) === -1) {
      return new Error(
        'Invalid prop `' +
          propName +
          '` supplied to' +
          ' `' +
          componentName +
          '`. Validation failed.',
      )
    }
  },
  disabled: PropTypes.bool,
}

export default Consents
