import { useRouter } from 'next/router'
import { useTranslation } from 'lib/withT'

// This component is displayed after a successful trial signup.
// It provides the user with options to start using the product.
const SuccessPack = () => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <>
      <button
        onClick={() =>
          router.push({
            pathname: '/einrichten',
            query: { context: 'trial' },
          })
        }
      >
        {t('Trial/Form/withAccess/setup/label')}
      </button>
      <button onClick={() => router.push('/')}>
        {t('Trial/Form/withAccess/button/label')}
      </button>
    </>
  )
}

export default SuccessPack
