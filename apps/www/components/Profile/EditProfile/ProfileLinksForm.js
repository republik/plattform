import { Fragment } from 'react'
import { isURL } from 'validator'
import { css } from 'glamor'
import { mediaQueries } from '@project-r/styleguide'

import FieldSet from '../../FieldSet'
import { useTranslation } from '../../../lib/withT'

import ProfileLinkIcon from '../ProfileLinkIcon'

const isHTTPUrl = (url) =>
  isURL(url, { require_protocol: true, protocols: ['http', 'https'] })

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

const ProfileLinks = ({ onChange, values, errors, dirty }) => {
  const { t } = useTranslation()
  return (
    <Fragment>
      <div {...styles.linkRow}>
        <ProfileLinkIcon url={values.link1} />
        <FieldSet
          values={values}
          errors={errors}
          dirty={dirty}
          onChange={onChange}
          fields={[
            {
              label: 'URL',
              name: 'link1',
              validator: (value) =>
                !!value &&
                !isHTTPUrl(value) &&
                value !== 'https://' &&
                t('profile/contact/publicUrl/error'),
            },
          ]}
        />
      </div>
      <div {...styles.linkRow}>
        <ProfileLinkIcon url={values.link2} />
        <FieldSet
          values={values}
          errors={errors}
          dirty={dirty}
          onChange={onChange}
          fields={[
            {
              label: 'URL',
              name: 'link3',
              validator: (value) =>
                !!value &&
                !isHTTPUrl(value) &&
                value !== 'https://' &&
                t('profile/contact/publicUrl/error'),
            },
          ]}
        />
      </div>
      <div {...styles.linkRow}>
        <ProfileLinkIcon url={values.link2} />
        <FieldSet
          values={values}
          errors={errors}
          dirty={dirty}
          onChange={onChange}
          fields={[
            {
              label: 'URL',
              name: 'link2',
              validator: (value) =>
                !!value &&
                !isHTTPUrl(value) &&
                value !== 'https://' &&
                t('profile/contact/publicUrl/error'),
            },
          ]}
        />
      </div>
    </Fragment>
  )
}

export default ProfileLinks
