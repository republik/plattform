import { Label, Checkbox, A, Radio } from '@project-r/styleguide'
import { css } from 'glamor'
import withT from '../../../lib/withT'
import Link from 'next/link'

const styles = {
  radio: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    ['> span']: {
      marginLeft: 34,
    },
  }),
}

const PrivacySettings = ({ user, onChange, values, errors, t }) => {
  console.log(values.hasPublicProfile)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {!user.isEligibleForProfile && (
        <Label>{t('profile/settings/isEligibleForProfile/notEligible')}</Label>
      )}
      <PublicCheckbox user={user} values={values} onChange={onChange} />
      <ListedCheckbox user={user} values={values} onChange={onChange} />
    </div>
  )
}

export const ListedCheckbox = withT(({ user, values, onChange, t }) => (
  <div
    {...styles.radio}
    style={{
      opacity: user.isAdminUnlisted ? 0.5 : 1,
    }}
  >
    <Checkbox
      checked={values.isListed}
      disabled={
        !(
          user.isListed ||
          ((user.statement || values.statement) &&
            (user.portrait || values.portrait))
        ) ||
        (!user.isListed && !user.isEligibleForProfile)
      }
      onChange={(_, checked) => {
        onChange({
          values: {
            isListed: checked,
          },
        })
      }}
    >
      {t('profile/settings/isListed/label')}
    </Checkbox>
    <Label>
      {t.elements(`profile/settings/isListed/${!!values.isListed}/note`, {
        communityLink: (
          <Link key='communityLink' href='/community' passHref legacyBehavior>
            <A target='_blank'>{t('profile/settings/privacy/communityLink')}</A>
          </Link>
        ),
      })}
    </Label>
  </div>
))

export const PublicCheckbox = withT(({ user, values, onChange, t }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <div {...styles.radio}>
      <Radio
        checked={values.hasPublicProfile}
        onChange={() => {
          onChange({
            values: {
              hasPublicProfile: true,
            },
          })
        }}
      >
       {t('profile/settings/hasPublicProfile/true/label')}
      </Radio>
      <Label>{t('profile/settings/hasPublicProfile/true/note')}</Label>
    </div>
    <div {...styles.radio}>
      <Radio
        checked={!values.hasPublicProfile}
        onChange={() => {
          onChange({
            values: {
              hasPublicProfile: false,
            },
          })
        }}
      >
        {t('profile/settings/hasPublicProfile/false/label')}
      </Radio>
      <Label>{t('profile/settings/hasPublicProfile/false/note')}</Label>
    </div>
  </div>
))

export default withT(PrivacySettings)
