import { IconEdit } from '@republik/icons'
import { Center, IconButton } from '@project-r/styleguide'

import { PUBLIKATOR_BASE_URL } from 'lib/constants'
import { useTranslation } from 'lib/withT'

const PublikatorLinkBlock = ({ breakout, center, repoId }) => {
  const { t } = useTranslation()

  return (
    <Center breakout={breakout} style={{ paddingBottom: 0, paddingTop: 30 }}>
      <div
        style={
          center
            ? {
                display: 'flex',
                justifyContent: 'center',
              }
            : {}
        }
      >
        <IconButton
          Icon={IconEdit}
          href={`${PUBLIKATOR_BASE_URL}/repo/${repoId}/tree`}
          target='_blank'
          title={t('feed/actionbar/edit')}
          label={t('feed/actionbar/edit')}
          labelShort={t('feed/actionbar/edit')}
          fill={'#E9A733'}
        />
      </div>
    </Center>
  )
}

export default PublikatorLinkBlock
