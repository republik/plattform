import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'
import withT from '../../../lib/withT'
import {
  A,
  Loader,
  Field,
  Checkbox,
  Overlay,
  OverlayToolbar,
  OverlayBody,
  Interaction,
  Label,
  Button,
  useColorContext,
  mediaQueries,
  CommentHeaderProfile,
} from '@project-r/styleguide'

import { withDiscussionPreferences } from '../graphql/enhancers/withDiscussionPreferences'
import { css } from 'glamor'
import Credential from '../../Credential'
import { errorToString } from '../../../lib/utils/errors'
import ErrorMessage from '../../ErrorMessage'

export const DiscussionPreferences = ({
  t,
  onClose,
  discussionPreferences: { loading, error, me, discussion },
  setDiscussionPreferences,
  autoCredential,
}) => (
  <Overlay onClose={onClose} mUpStyle={{ minHeight: 240 }}>
    <Loader
      loading={loading}
      error={error}
      message={t('components/DiscussionPreferences/loading')}
      render={() => {
        const { credentials } = me
        const { rules, userPreference } = discussion

        return (
          <DiscussionPreferencesEditor
            t={t}
            credentials={credentials}
            rules={rules}
            autoCredential={autoCredential}
            userPreference={userPreference}
            onClose={onClose}
            setDiscussionPreferences={setDiscussionPreferences}
            me={me}
          />
        )
      }}
    />
  </Overlay>
)

DiscussionPreferences.propTypes = {
  discussionId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  discussionPreferences: PropTypes.object.isRequired,
  setDiscussionPreferences: PropTypes.func.isRequired,
}

export default compose(withT, withDiscussionPreferences)(DiscussionPreferences)

/**
 * Get the initial-state of the discussion-preferences form.
 * @param userPreferences
 * @param rules
 * @param autoCredential
 * @returns {{credential: (*|null), anonymity: boolean}}
 */
function getInitialState(
  userPreferences = {},
  rules = {},
  autoCredential = null,
) {
  let { anonymity = false, credential } = userPreferences

  if (!credential && autoCredential) {
    credential = autoCredential
  }

  switch (rules.anonymity) {
    case 'ALLOWED':
      // when allowed keep state given in userPreferences
      break
    case 'FORBIDDEN':
      anonymity = false
      break
    case 'ENFORCED':
      anonymity = true
      break
    default:
      console.warn(
        `DiscussionPreferencesForm: unknown anonymity permission: ${rules.anonymity}`,
      )
      anonymity = false
      break
  }

  return {
    anonymity,
    credential: credential ? credential.description : null,
  }
}

const styles = {
  previewWrapper: css({
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    padding: `0 ${OverlayBody.PADDING}px`,
    margin: `-${OverlayBody.PADDING}px -${OverlayBody.PADDING}px ${OverlayBody.PADDING}px`,
    [mediaQueries.mUp]: {
      marginTop: 0,
      paddingBottom: OverlayBody.PADDING,
    },
    '& > p': {
      marginTop: 0,
      marginBottom: 10,
    },
  }),
  commentHeaderWrapper: css({
    margin: '0px -20px',
    padding: 20,
    [mediaQueries.mUp]: {
      margin: 0,
    },
    display: 'flex',
    flexDirection: 'column',
    '& > *:not(:last-child)': {
      marginBottom: 10,
    },
  }),
  fieldWrapper: css({
    marginBottom: 24,
    '& > *:not(:last-child)': {
      display: 'block',
      marginBottom: 10,
    },
  }),
  suggestedCredentialsWrapper: css({
    '& > *:not(:last-child)': {
      marginBottom: 10,
    },
  }),
  suggestedCredentialsContainer: css({
    margin: '0 10',
    display: 'flex',
    flexDirection: 'column',
  }),
}

const DiscussionPreferencesEditor = ({
  userPreference,
  autoCredential,
  t,
  credentials,
  rules,
  onClose,
  setDiscussionPreferences,
  me,
}) => {
  const [colorScheme] = useColorContext()
  const [initialState] = useState(
    getInitialState(userPreference, rules, autoCredential),
  )
  const [state, setState] = useState(initialState)
  const [error, setError] = useState(null)

  const [showAllSuggestedCredentials, setShowAllSuggestedCredentials] =
    useState(false)

  const handleSubmit = async (formState) => {
    try {
      setError(null)
      await setDiscussionPreferences(formState.anonymity, formState.credential)
      onClose()
    } catch (error) {
      setError(errorToString(error))
    }
  }

  const existingCredential = credentials.find(
    (c) => c.description === state.credential,
  )
  const isListedCredential = existingCredential && existingCredential.isListed

  const credentialSuggestions = credentials.filter(
    (c) => c.description !== state.credential,
  )

  const previewData = useMemo(() => {
    const credentialInSuggestions = credentials.find(
      (value) => value.description === state.credential,
    )

    return {
      credential: credentialInSuggestions || { description: state.credential },
      name: state.anonymity ? t('discussion/displayUser/anonymous') : me.name,
      portrait: !state.anonymity ? me.portrait : undefined,
    }
  }, [state.anonymity, state.credential, credentialSuggestions, me])

  const suggestedCredentialButtonStyling = useMemo(
    () =>
      css({
        all: 'unset',
        cursor: 'pointer',
        padding: 10,
        '@media(hover)': {
          ':hover': {
            backgroundColor: colorScheme.getCSSColor('hover'),
          },
        },
        '&:not(:last-child)': {
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: colorScheme.getCSSColor('divider'),
        },
      }),
    [colorScheme],
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit(state)
      }}
    >
      <OverlayToolbar
        title={t('components/DiscussionPreferences/modalTitle')}
        onClose={onClose}
      />
      <OverlayBody>
        <div
          {...styles.previewWrapper}
          {...colorScheme.set('borderBottomColor', 'divider')}
        >
          <div
            {...styles.commentHeaderWrapper}
            {...colorScheme.set('backgroundColor', 'hover')}
          >
            <Label>
              {t('components/DiscussionPreferences/profilePreview')}
            </Label>
            <CommentHeaderProfile
              t={t}
              displayAuthor={{
                name: previewData.name,
                profilePicture: previewData.portrait,
                credential: previewData.credential,
              }}
            />
          </div>
        </div>
        <div {...styles.fieldWrapper}>
          <Interaction.H3>
            {t('components/DiscussionPreferences/credentialHeading')}
          </Interaction.H3>
          <Label>
            {t('components/DiscussionPreferences/credential/description')}
          </Label>
          <Field
            label={t('components/DiscussionPreferences/credentialLabel')}
            error={
              state.credential?.length > 40 &&
              t('components/DiscussionPreferences/credentialLabel/tooLong')
            }
            value={state.credential}
            onChange={(_, val) => {
              setState((curr) => ({
                ...curr,
                credential: val,
              }))
            }}
            showClearIcon
          />
          {isListedCredential && state.anonymity && (
            <div style={{ marginBottom: 10 }}>
              <Label>
                {t(
                  'components/DiscussionPreferences/credentialAnonymityWarning',
                )}
              </Label>
            </div>
          )}
          {credentialSuggestions && credentialSuggestions.length > 0 && (
            <div {...styles.suggestedCredentialsWrapper}>
              <Label>
                {t('components/DiscussionPreferences/existingCredentialLabel')}
              </Label>
              <div {...styles.suggestedCredentialsContainer}>
                {credentialSuggestions
                  .slice(
                    0,
                    showAllSuggestedCredentials
                      ? credentialSuggestions.length - 1
                      : 4,
                  )
                  .map((item) => (
                    <button
                      key={item.description}
                      onClick={() =>
                        setState((curr) => ({
                          ...curr,
                          credential: item.description,
                        }))
                      }
                      {...suggestedCredentialButtonStyling}
                    >
                      <Credential
                        {...item}
                        textColor={colorScheme.getCSSColor('text')}
                      />
                    </button>
                  ))}
              </div>
              {!showAllSuggestedCredentials &&
                credentialSuggestions.length >= 5 && (
                  <A
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      setShowAllSuggestedCredentials(true)
                    }}
                  >
                    {t('components/DiscussionPreferences/showAllCredentials')}
                  </A>
                )}
            </div>
          )}
        </div>
        {rules.anonymity !== 'FORBIDDEN' && (
          <div {...styles.fieldWrapper}>
            <Interaction.H3>
              {t('components/DiscussionPreferences/commentAnonymously')}
            </Interaction.H3>
            <Label>
              {t(
                'components/DiscussionPreferences/commentAnonymously/description',
              )}
            </Label>
            <div>
              <Checkbox
                /*
                 Possible anonymity rules are
                 ['ALLOWED', 'ENFORCED', 'FORBIDDEN']
                 THe checkbox should only be enabled if the rule is 'ALLOWED'
                 */
                disabled={rules?.anonymity !== 'ALLOWED'}
                checked={state.anonymity}
                onChange={(_, val) => {
                  setState((curr) => ({
                    ...curr,
                    anonymity: val,
                    credential:
                      val && curr.credential === initialState.credential
                        ? '' // remove auto credential when setting anonymous to true
                        : curr.credential,
                  }))
                }}
              >
                {t('components/DiscussionPreferences/commentAnonymouslyLabel')}
              </Checkbox>
            </div>
          </div>
        )}
        {error && <ErrorMessage error={error} />}
        <div
          {...css({
            width: '100%',
            [mediaQueries.mUp]: {
              maxWidth: 'max-content',
            },
          })}
        >
          <Button type='submit' block>
            {t('components/DiscussionPreferences/save')}
          </Button>
        </div>
      </OverlayBody>
    </form>
  )
}
