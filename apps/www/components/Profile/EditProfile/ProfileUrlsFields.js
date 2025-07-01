import { Fragment, useState, useEffect } from 'react'
import { isURL } from 'validator'
import { css } from 'glamor'
import { mediaQueries, Field } from '@project-r/styleguide'

import { useTranslation } from '../../../lib/withT'

import ProfileUrlIcon from '../Common/ProfileUrlIcon'

const isHTTPUrl = (url) =>
  isURL(url, { require_host: true, require_tld: true, require_protocol: true })

const styles = {
  linkRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    [mediaQueries.mUp]: {
      gap: 32,
    },
  }),
}

const ProfileUrlFields = ({ onChange, values, errors }) => {
  const [profileUrl1, setProfileUrl1] = useState(values.profileUrls?.[0] ?? '')
  const [profileUrl2, setProfileUrl2] = useState(values.profileUrls?.[1] ?? '')
  const [profileUrl3, setProfileUrl3] = useState(values.profileUrls?.[2] ?? '')

  const validator = (value) =>
    !!value && !isHTTPUrl(value) && t('profile/url/error')

  useEffect(() => {
    onChange({
      values: {
        profileUrls: [profileUrl1, profileUrl2, profileUrl3].filter(
          (v) => v !== '',
        ),
      },
      errors: {
        profileUrls:
          validator(profileUrl1) ||
          validator(profileUrl2) ||
          validator(profileUrl3)
            ? [
                validator(profileUrl1),
                validator(profileUrl2),
                validator(profileUrl3),
              ]
            : false,
      },
      dirty: {
        profileUrls: [
          profileUrl1 !== values.profileUrls?.[0],
          profileUrl2 !== values.profileUrls?.[1],
          profileUrl3 !== values.profileUrls?.[2],
        ],
      },
    })
  }, [profileUrl1, profileUrl2, profileUrl3])

  const { t } = useTranslation()
  return (
    <Fragment>
      <div {...styles.linkRow}>
        <ProfileUrlIcon url={profileUrl1} />
        <Field
          value={profileUrl1}
          label='URL'
          error={errors.profileUrls?.[0]}
          name={`profileUrl-${profileUrl1}`}
          onChange={(e) => {
            setProfileUrl1(e.currentTarget.value)
          }}
        />
      </div>
      <div {...styles.linkRow}>
        <ProfileUrlIcon url={profileUrl2} />
        <Field
          value={profileUrl2}
          label='URL'
          name={`profileUrl-${profileUrl2}`}
          error={errors.profileUrls?.[1]}
          onChange={(e) => {
            setProfileUrl2(e.currentTarget.value)
          }}
        />
      </div>
      <div {...styles.linkRow}>
        <ProfileUrlIcon url={profileUrl3} />
        <Field
          value={profileUrl3}
          label='URL'
          error={errors.profileUrls?.[2]}
          name={`profileUrl-${profileUrl3}`}
          onChange={(e) => {
            setProfileUrl3(e.currentTarget.value)
          }}
        />
      </div>
    </Fragment>
  )
}

export default ProfileUrlFields
