import { ErrorPage } from '@app/components/layout/error-page'
import { css } from '@republik/theme/css'
import Link from 'next/link'

function NotFound() {
  return (
    <ErrorPage>
      <h1
        className={css({
          textStyle: 'h1Sans',
          fontSize: '8xl',
          textAlign: 'center',
          lineHeight: '1',
          md: {
            fontSize: '300px',
          },
        })}
      >
        404
      </h1>
      <p>Die Seite konnte nicht gefunden werden</p>
      <Link
        href='/'
        className={css({
          color: 'primary',
          textDecoration: 'none',
          _hover: {
            color: 'primaryHover',
          },
        })}
      >
        Zum Magazin
      </Link>
    </ErrorPage>
  )
}

export default NotFound
