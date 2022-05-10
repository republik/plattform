import { Fragment } from 'react'
import { isURL } from 'validator'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import { Dropdown, Label, Interaction, IconButton } from '@project-r/styleguide'
import {
  FacebookIcon,
  TwitterIcon,
  LanguageIcon,
  MailOutlineIcon,
  NoteAddIcon,
  VpnKeyIcon,
} from '@project-r/styleguide'
import withT from '../../lib/withT'
import withInNativeApp from '../../lib/withInNativeApp'
import { withSupporter } from '../Auth/checkRoles'
import { ADMIN_BASE_URL } from '../../lib/constants'
import FieldSet, { styles as fieldSetStyles } from '../FieldSet'

import { DEFAULT_VALUES } from './Page'

const isHTTPUrl = (url) =>
  isURL(url, { require_protocol: true, protocols: ['http', 'https'] })

const fields = (t) => [
  {
    label: t('profile/contact/facebook/label'),
    name: 'facebookId',
  },
  {
    label: t('profile/contact/twitter/label'),
    name: 'twitterHandle',
  },
  {
    label: t('profile/contact/publicUrl/label'),
    name: 'publicUrl',
    validator: (value) =>
      !!value &&
      !isHTTPUrl(value) &&
      value !== DEFAULT_VALUES.publicUrl &&
      t('profile/contact/publicUrl/error'),
  },
]

const AccessRoleDropdown = ({ t, ...props }) => (
  <Dropdown
    items={['ADMIN', 'EDITOR', 'MEMBER', 'PUBLIC'].map((value) => ({
      value: value,
      text: t(`profile/contact/access/${value}`),
    }))}
    {...props}
  />
)

const Contact = ({
  user,
  isEditing,
  onChange,
  values,
  errors,
  dirty,
  t,
  showSupportLink,
  isSupporter,
  inNativeIOSApp,
  electionBallot,
}) => {
  if (isEditing) {
    return (
      <Fragment>
        <FieldSet
          values={values}
          errors={errors}
          dirty={dirty}
          onChange={onChange}
          fields={fields(t)}
        />
        <AccessRoleDropdown
          t={t}
          label={t('profile/contact/email/access/label')}
          value={values.emailAccessRole}
          onChange={(item) => {
            onChange({
              values: {
                emailAccessRole: item.value,
              },
            })
          }}
        />
        <FieldSet
          values={values}
          errors={errors}
          dirty={dirty}
          onChange={(fields) => {
            const { pgpPublicKey } = fields.values
            if (pgpPublicKey && pgpPublicKey.match(/PGP PRIVATE KEY/)) {
              onChange({
                values: {
                  pgpPublicKey: '',
                },
              })
              window.alert(t('profile/contact/pgpPublicKey/error/private'))
              return
            }
            onChange(fields)
          }}
          additionalFieldProps={() => {
            return {
              renderInput: (props) => (
                <textarea row={1} {...fieldSetStyles.autoSize} {...props} />
              ),
            }
          }}
          fields={[
            {
              label: t('profile/contact/pgpPublicKey/label'),
              name: 'pgpPublicKey',
            },
          ]}
        />
        {!!user.phoneNumber && (
          <Fragment>
            <FieldSet
              values={values}
              errors={errors}
              dirty={dirty}
              onChange={onChange}
              fields={[
                {
                  label: t('profile/contact/phoneNumber/label'),
                  name: 'phoneNumber',
                },
                {
                  label: t('profile/contact/phoneNumberNote/label'),
                  name: 'phoneNumberNote',
                },
              ]}
            />
            <AccessRoleDropdown
              t={t}
              label={t('profile/contact/phoneNumber/access/label')}
              value={values.phoneNumberAccessRole}
              onChange={(item) => {
                onChange({
                  values: {
                    phoneNumberAccessRole: item.value,
                  },
                })
              }}
            />
          </Fragment>
        )}
      </Fragment>
    )
  }

  const customStyle = electionBallot
    ? { marginRight: 16, marginBottom: 0 }
    : undefined

  return (
    <Fragment>
      <div {...styles.icons} {...styles.contactRow}>
        {user.facebookId && (
          <IconButton
            Icon={FacebookIcon}
            style={customStyle}
            href={`https://www.facebook.com/${user.facebookId}`}
          />
        )}
        {user.twitterHandle && (
          <IconButton
            Icon={TwitterIcon}
            style={customStyle}
            href={`https://twitter.com/${user.twitterHandle}`}
          />
        )}
        {user.email && (
          <IconButton Icon={MailOutlineIcon} href={`mailto:${user.email}`} />
        )}
        {user.publicUrl &&
          user.publicUrl !== DEFAULT_VALUES.publicUrl &&
          isHTTPUrl(user.publicUrl) && (
            <IconButton
              Icon={LanguageIcon}
              style={
                electionBallot
                  ? {
                      marginRight: 0,
                      marginBottom: 0,
                    }
                  : undefined
              }
              href={user.publicUrl}
            />
          )}
        {isSupporter && showSupportLink && ADMIN_BASE_URL && (
          <IconButton
            Icon={NoteAddIcon}
            fill='#FF10D9'
            size={22}
            href={`${ADMIN_BASE_URL}/users/${user.id}`}
            target='_blank'
          />
        )}
      </div>
      {!inNativeIOSApp && user.pgpPublicKeyId && (
        <div {...styles.contactRow}>
          <IconButton
            href={`/pgp/${user.username || user.id}.asc`}
            Icon={VpnKeyIcon}
            label={user.pgpPublicKeyId.toUpperCase()}
            labelShort={user.pgpPublicKeyId.toUpperCase()}
          />
        </div>
      )}
      {user.email && user.emailAccessRole !== 'PUBLIC' && (
        <div {...styles.contactRow}>
          <Label style={{ display: 'block', marginBottom: 16 }}>
            {t(
              `profile/contact/access/${user.emailAccessRole}/note`,
              {
                field: t('profile/contact/email/label'),
              },
              '',
            )}
          </Label>
        </div>
      )}
      {user.phoneNumber && (
        <div {...styles.contactRow}>
          <Interaction.P>
            <a
              href={`tel:${user.phoneNumber}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {user.phoneNumber}
            </a>
            <Label style={{ display: 'block', marginBottom: 5 }}>
              {user.phoneNumberNote}
            </Label>
          </Interaction.P>
          <Label style={{ display: 'block', marginBottom: 16 }}>
            {t(
              `profile/contact/access/${user.phoneNumberAccessRole}/note`,
              {
                field: t('profile/contact/phoneNumber/label'),
              },
              '',
            )}
          </Label>
        </div>
      )}
    </Fragment>
  )
}

const styles = {
  icons: css({
    display: 'flex',
  }),
  contactRow: css({
    marginTop: 16,
  }),
}

export default compose(withT, withInNativeApp, withSupporter)(Contact)
