import Loader from '../Loader'
import { RenderFront } from '../Front'
import { useTranslation } from '../../lib/withT'

const MiniFront = ({ loading, error, front }) => {
  const { t } = useTranslation()
  return (
    <Loader
      loading={loading}
      error={error}
      render={() =>
        front ? (
          <RenderFront
            t={t}
            isEditor={false}
            front={front}
            nodes={front.children.nodes}
          />
        ) : null
      }
    />
  )
}

export default MiniFront
