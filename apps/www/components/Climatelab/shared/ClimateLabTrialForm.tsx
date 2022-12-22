import { css } from 'glamor'
import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { useMe } from '../../../lib/context/MeContext'
import { CLIMATE_LAB_ROLE } from '../constants'
import Button from '../shared/Button'
import Input from './Input'
import { ClimatelabColors } from '../ClimatelabColors'
import { useMemo, useState } from 'react'
import { Form, Formik, FormikHelpers } from 'formik'
import * as yup from 'yup'
import Checkbox from './Checkbox'
import { useTranslation } from '../../../lib/withT'
import CodeAuthorization from '../../Auth/CodeAuthorization'

type EmailRegistrationFormValues = {
  email: string
  acceptTerms: boolean
}
type EmailVerificationFormValues = {
  code: string
}

type ClimateLabTrialFormProps = {}

type TrialSignUpStep =
  | 'email-registration'
  | 'email-verification'
  | 'request-access'

const ClimateLabTrialForm = (props: ClimateLabTrialFormProps) => {
  const [step, setStep] = useState<TrialSignUpStep>('email-registration')
  const [emailToVerify, setEmailToVerify] = useState<string>('')

  const { t } = useTranslation()
  const { me } = useMe()
  const roles = me?.roles ?? []

  const initialEmailRegistrationFormValues: EmailRegistrationFormValues = {
    email: '',
    acceptTerms: false,
  }
  const initialEmailVerificationFormValues: EmailVerificationFormValues = {
    code: '',
  }

  const isClimateLabMember = roles.includes(CLIMATE_LAB_ROLE)

  const handleRegisterEmail = (
    value: EmailRegistrationFormValues,
    helpers: FormikHelpers<EmailRegistrationFormValues>,
  ) => {
    helpers.setSubmitting(true)
    alert('Registering email: ' + JSON.stringify(value, null, 2))
    setStep('email-verification')
    setEmailToVerify(value.email)
    helpers.setSubmitting(false)
  }

  const handleVerifyEmail = () => {
    alert('Verifying email: ')
  }

  const handleRequestAccess = () => {
    alert('Submitting email: ')
  }

  const currentForm = useMemo(() => {
    if (!me && step === 'email-registration') {
      return (
        <Formik
          initialValues={initialEmailRegistrationFormValues}
          onSubmit={handleRegisterEmail}
          validationSchema={yup.object().shape({
            email: yup.string().email('enter a valid mail').required(),
            acceptTerms: yup.boolean().oneOf([true], t('accept-terms-of-use')),
          })}
          validateOnChange={false}
        >
          {({ isSubmitting, touched, isValid }) => (
            <Form {...styles.wrapper}>
              <Input name='email' type='email' placeholder='E-Mail-Adresse' />
              <Checkbox
                name='acceptTerms'
                label={
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('pledge/consents/label/PRIVACY'),
                    }}
                  />
                }
              />
              <Button
                type='submit'
                disabled={isSubmitting || !touched || !isValid}
              >
                Ich bin dabei
              </Button>
            </Form>
          )}
        </Formik>
      )
    } else if (step === 'email-verification') {
      return <CodeAuthorization />
    } else {
      return null
    }
  }, [
    handleRegisterEmail,
    initialEmailRegistrationFormValues,
    handleVerifyEmail,
    initialEmailVerificationFormValues,
    me,
  ])

  if (isClimateLabMember) {
    return (
      <Button onClick={() => alert('Navigating to HQ')}>
        Zum Klimalabor HQ
      </Button>
    )
  }

  if (me) {
    return (
      <Button
        onClick={() => {
          alert('Signup member')
          handleRequestAccess()
        }}
      >
        Ich bin dabei
      </Button>
    )
  }

  return (
    <div>
      {currentForm}
      <p {...styles.text}>
        Schon dabei?{' '}
        <a {...styles.link} href='#'>
          Einloggen
        </a>
      </p>
    </div>
  )
}

export default ClimateLabTrialForm

const styles = {
  wrapper: css({
    '> * + *': {
      marginTop: '2rem',
    },
  }),
  text: css({
    ...fontStyles.sansSerifMedium,
    lineHeight: '1.6em',
    fontSize: 24,
  }),
  link: css({
    color: ClimatelabColors.text,
  }),
}
