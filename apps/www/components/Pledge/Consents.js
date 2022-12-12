import { useState } from 'react'
import PropTypes from 'prop-types'
import { ascending } from 'd3-array'
import { Checkbox, RawHtml, shouldIgnoreClick } from '@project-r/styleguide'

import withT from '../../lib/withT'
import LegalOverlay, { SUPPORTED_HREFS } from './LegalOverlay'

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
    const [overlay, setOverlay] = useState()
    return (
      <>
        {overlay && (
          <LegalOverlay
            {...overlay}
            onClose={() => {
              setOverlay()
            }}
          />
        )}
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
          <span
            onClick={(event) => {
              const href =
                event.target.getAttribute && event.target.getAttribute('href')
              if (
                event.target.nodeName === 'A' &&
                !shouldIgnoreClick(event, true) &&
                SUPPORTED_HREFS.includes(href)
              ) {
                event.preventDefault()
                setOverlay({
                  href: href,
                  title: event.target.textContent,
                })
              }
            }}
          >
            <RawHtml
              error={error}
              dangerouslySetInnerHTML={{
                __html: t(`pledge/consents/label/${stringifyCombo(required)}`),
              }}
            />
          </span>
        </Checkbox>
      </>
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
