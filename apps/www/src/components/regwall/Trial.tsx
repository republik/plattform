import Image from 'next/image'
import TrialForm from '../auth/trial'
import { CDN_FRONTEND_BASE_URL } from 'lib/constants'
import { css } from '@republik/theme/css'
import { LoginForm } from '../auth/login/login-form'

const Trial = () => {
  return (
    <div>
      <Image
        src={`${CDN_FRONTEND_BASE_URL}/static/regwall/cover.svg`}
        alt='Illustration registration wall'
        width={400}
        height={400}
      />
      <h2 className={css({ textStyle: 'h2Sans' })}>
        Weiterlesen geht ganz einfach
      </h2>
      <p>
        <b>Als Gast:</b> voller Zugriff für 7 Tage.
      </p>
      <p>
        Ohne Zahlungsmethode, ohne automatische Verlängerung, und ganz ohne
        Stress.
      </p>
      <LoginForm />
    </div>
  )
}

export default Trial
