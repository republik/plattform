import React from 'react'
import PropTypes from 'prop-types'
import { RawHtml } from '@project-r/styleguide'
import withT from '../lib/withT'

const RawHtmlTranslation = ({
  t,
  first,
  translationKey,
  replacements = {},
  missingValue,
  error,
}) => {
  const mapElement = (element, i) =>
    typeof element === 'string' ? (
      <RawHtml
        key={`html${i}`}
        error={error}
        dangerouslySetInnerHTML={{
          __html: element,
        }}
      />
    ) : (
      element
    )

  const safeReplacements = Object.keys(replacements).reduce((safe, key) => {
    const value = replacements[key]
    if (typeof value === 'string') {
      safe[key] = <span key={key}>{value}</span>
    } else {
      safe[key] = value
    }
    return safe
  }, {})
  return first
    ? t.first.elements(first, safeReplacements, missingValue).map(mapElement)
    : t.elements(translationKey, safeReplacements, missingValue).map(mapElement)
}

RawHtmlTranslation.propTypes = {
  t: PropTypes.func.isRequired,
  translationKey: PropTypes.string,
  first: PropTypes.arrayOf(PropTypes.string.isRequired),
  replacements: PropTypes.object,
  missingValue: PropTypes.string,
}

export default withT(RawHtmlTranslation)
