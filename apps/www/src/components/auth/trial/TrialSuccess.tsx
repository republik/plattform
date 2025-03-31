import { useRouter } from 'next/router'
import { useTranslation } from 'lib/withT'

const SuccessPack = ({ context }) => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <>
      <button
        onClick={() =>
          router.push({
            pathname: '/einrichten',
            query: { context },
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
