import { css } from '@republik/theme/css'
import Link from 'next/link'

const Login = () => {
  return (
    <p>
      Haben Sie ein Abonnement?{' '}
      <Link href='/anmelden'>
        <span
          className={css({ textDecoration: 'underline', color: '#FF6969' })}
        >
          Anmelden.
        </span>
      </Link>
    </p>
  )
}

export default Login
