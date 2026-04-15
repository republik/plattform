import { Center, Interaction, colors } from '@project-r/styleguide'
import { css } from 'glamor'

import { useTranslation } from 'lib/withT'

const styles = {
  prepublicationNotice: css({
    backgroundColor: colors.social,
  }),
}

const PrepubNotice = ({ meta, breakout }) => {
  const { t } = useTranslation()
  if (!meta?.prepublication) return null
  return (
    <div {...styles.prepublicationNotice}>
      <Center breakout={breakout}>
        <Interaction.P>{t('article/prepublication/notice')}</Interaction.P>
      </Center>
    </div>
  )
}

export default PrepubNotice
