import { css } from 'glamor'
import isEmail from 'validator/lib/isEmail'

import withT from '../../lib/withT'

import ErrorMessage from '../ErrorMessage'

import {
  Button,
  InlineSpinner,
  Field,
  useColorContext,
} from '@project-r/styleguide'

const styles = {
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
    alignItems: 'flex-end',
  }),
  input: css({
    marginRight: 10,
    marginBottom: 0,
    width: '58%',
    flexGrow: 1,
  }),
  button: css({
    textAlign: 'center',
    marginBottom: 15,
    minWidth: 160,
  }),
  hints: css({
    marginTop: -5,
    fontSize: 16,
    lineHeight: '24px',
  }),
}

export const checkEmail = ({ value, shouldValidate, t }) => ({
  email: value,
  error:
    (value.trim().length <= 0 && t('signIn/email/error/empty')) ||
    (!isEmail(value) && t('signIn/email/error/invalid')),
  dirty: shouldValidate,
})

const EmailForm = (props) => {
  const {
    t,
    label,
    beforeForm,
    onChange,
    onSubmit,
    hints,
    loading,
    error,
    dirty,
    email,
    serverError,
    black,
    smallButton,
  } = props

  const [colorScheme] = useColorContext()

  return (
    <div>
      {beforeForm}
      <form onSubmit={onSubmit}>
        <div {...styles.form}>
          <div {...styles.input}>
            <Field
              black={black}
              name='email'
              type='email'
              label={t('signIn/email/label')}
              error={dirty && error}
              onChange={(_, value, shouldValidate) => {
                onChange(
                  checkEmail({
                    t,
                    value,
                    shouldValidate,
                  }),
                )
              }}
              value={email}
            />
          </div>
          <div {...styles.button}>
            {loading ? (
              <InlineSpinner />
            ) : (
              <Button block black={black} type='submit' small={smallButton}>
                {label || t('signIn/button')}
              </Button>
            )}
          </div>
        </div>
      </form>
      {!!hints && (
        <div {...styles.hints} {...colorScheme.set('color', 'text')}>
          {hints}
        </div>
      )}
      {!!serverError && <ErrorMessage error={serverError} />}
    </div>
  )
}

export default withT(EmailForm)
