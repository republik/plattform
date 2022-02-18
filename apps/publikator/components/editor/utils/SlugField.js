import React, { useState } from 'react'
import { Field, slug } from '@project-r/styleguide'
import withT from '../../../lib/withT'

export default withT(({ t, onChange, value, isTemplate, ...props }) => {
  const [error, setError] = useState('')

  const onSlugChange = (event) => {
    setError(
      isTemplate &&
        event.target.value.length > 30 &&
        t('metaData/field/repoSlug/error/tooLong'),
    )
    onChange(event, slug(event.target.value))
  }

  return (
    <Field
      {...props}
      renderInput={(props) => <input {...props} onBlur={onSlugChange} />}
      onChange={onChange}
      value={value}
      error={error}
    />
  )
})
