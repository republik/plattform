import {
  Label,
  Checkbox,
  A,
  Radio,
  useColorContext,
} from '@project-r/styleguide'
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
  const [colorScheme] = useColorContext()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {!user.isEligibleForProfile && (
        <Label>{t('profile/settings/isEligibleForProfile/notEligible')}</Label>
      )}
      <PublicSelection user={user} values={values} onChange={onChange} />
      <hr {...colorScheme.set('color', 'divider')} />
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
      {t.elements(`profile/settings/isListed/note`, {
        communityLink: (
          <Link key='communityLink' href='/community' passHref legacyBehavior>
            <A target='_blank'>{t('profile/settings/privacy/communityLink')}</A>
          </Link>
        ),
      })}
    </Label>
  </div>
))

export const PublicSelection = withT(({ user, values, onChange, t }) => (
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
