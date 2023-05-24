import { useState, useRef, useEffect } from 'react'
import compose from 'lodash/flowRight'
import { merge, css } from 'glamor'

import {
  Button,
  Interaction,
  Field,
  A,
  InlineSpinner,
  useColorContext,
} from '@project-r/styleguide'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import { scrollIt } from '../../lib/utils/scroll'

import withAuthorizeSession from './withAuthorizeSession'
import { IconDone } from '@republik/icons'

const { H3, P, Emphasis } = Interaction

const CODE_LENGTH = 6

const styles = {
  button: css({
    width: 160,
    textAlign: 'center',
  }),
  help: css({
    listStyleType: 'none',
    marginTop: 40,
    paddingLeft: 0,
    '> li': {
      paddingBottom: 10,
    },
  }),
  minimalHelp: css({
    margin: '10px 0 0 0',
  }),
  description: css({
    marginBottom: 20,
  }),
}

const CodeAuthorization = ({
  tokenType,
  email,
  onCancel,
  t,
  minimal,
  authorizeSession,
  me,
  onSuccess,
}) => {
  const [code, setCode] = useState('')
  const [payload, setPayload] = useState('')
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState(null)
  const [mutating, setMutating] = useState(false)
  const formRef = useRef()
  const [colorScheme] = useColorContext()

  const checkCode = ({ value = '', shouldValidate, t }) => {
    const payload = value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH)
    setCode(value.replace(/[^0-9\s]/g, ''))
    setPayload(payload)
    setError(
      (payload.length === 0 && t('Auth/CodeAuthorization/code/missing')) ||
        (payload.length < CODE_LENGTH &&
          t('Auth/CodeAuthorization/code/tooShort')),
    )
    setDirty(shouldValidate)
  }

  const handleMutateError = () => {
    setError(t('Auth/CodeAuthorization/code/invalid'))
    setDirty(true)
    setMutating(false)
  }

  const onSubmit = (e) => {
    e && e.preventDefault()

    setMutating(true)
    authorizeSession({
      email,
      tokens: [{ type: tokenType, payload: payload }],
    }).catch(handleMutateError)
  }

  const listStyle = merge(styles.help, minimal && styles.minimalHelp)

  useEffect(() => {
    const { top, height } = formRef.current.getBoundingClientRect()
    const { pageYOffset, innerHeight } = window
    const target = pageYOffset + top - innerHeight + height + 20
    const inViewport = top + height < innerHeight

    if (!inViewport) {
      scrollIt(target, 400)
    }
  }, [])

  useEffect(() => {
    if (me) {
      onSuccess(me)
    }
  }, [me])

  // auto submit
  useEffect(() => {
    if (payload && payload.length === CODE_LENGTH) {
      onSubmit()
    }
  }, [payload])

  return (
    <form
      onSubmit={onSubmit}
      ref={formRef}
      {...colorScheme.set('color', 'text')}
    >
      {minimal ? (
        <p>
          {t.elements('Auth/CodeAuthorization/description', {
            emphasis: (
              <Emphasis key='emphasis'>
                {t('Auth/CodeAuthorization/description/emphasis/email', {
                  email: email,
                })}
              </Emphasis>
            ),
          })}
        </p>
      ) : (
        <>
          <H3>{t('Auth/CodeAuthorization/title')}</H3>
          <P {...styles.description}>
            {t.elements('Auth/CodeAuthorization/description', {
              emphasis: (
                <Emphasis key='emphasis'>
                  {t('Auth/CodeAuthorization/description/emphasis')}
                </Emphasis>
              ),
            })}
          </P>
        </>
      )}
      <Field
        renderInput={(props) => <input {...props} pattern={'[0-9]*'} />}
        label={t('Auth/CodeAuthorization/code/label')}
        value={code}
        autoComplete='false'
        error={dirty && error}
        icon={
          minimal &&
          (mutating ? (
            <InlineSpinner size='30px' />
          ) : (
            <IconDone
              style={{ cursor: 'pointer' }}
              size={30}
              onClick={onSubmit}
              {...colorScheme.set('fill', 'text')}
            />
          ))
        }
        onChange={(_, value, shouldValidate) => {
          checkCode({ value, shouldValidate, t })
        }}
      />
      {!minimal && (
        <div {...styles.button}>
          {mutating ? (
            <InlineSpinner />
          ) : (
            <Button
              block
              type='submit'
              primary
              disabled={!code || error || mutating}
            >
              {t('Auth/CodeAuthorization/button/label')}
            </Button>
          )}
        </div>
      )}
      <ul {...listStyle}>
        <li>
          <A href='#' onClick={onCancel}>
            {t('Auth/CodeAuthorization/help/cancelLink')}
          </A>
        </li>
        <li {...colorScheme.set('color', 'textSoft')}>
          {t('Auth/CodeAuthorization/help/lastResort')}
        </li>
      </ul>
    </form>
  )
}

export default compose(withMe, withT, withAuthorizeSession)(CodeAuthorization)
