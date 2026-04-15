import { css } from 'glamor'
import { useTranslation } from '../../../lib/withT'

const styles = {
  emptyDiscussion: css({
    margin: '20px 0',
  }),
}

const EmptyDiscussion = () => {
  const { t } = useTranslation()
  return (
    <div {...styles.emptyDiscussion}>{t('components/Discussion/empty')}</div>
  )
}

export default EmptyDiscussion
