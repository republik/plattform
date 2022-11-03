import { css } from 'glamor'
import {
  Logo,
  mediaQueries,
  fontStyles,
  useColorContext,
} from '@project-r/styleguide'
import { useTranslation } from '../../lib/withT'

export default function LeadSection() {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.container} {...colorScheme.set('color', 'text')}>
      <div {...styles.logo}>
        <Logo />
      </div>
      <p {...styles.lead}>{t('marketing/page/lead/subtitle')}</p>
      <p {...styles.lead}>{t('marketing/page/lead/info')}</p>
    </div>
  )
}

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [mediaQueries.mUp]: {
      alignItems: 'flex-start',
    },
  }),
  lead: css({
    ...fontStyles.serifRegular,
    fontSize: 20,
    lineHeight: 1.3,
    marginBottom: 0,
    textAlign: 'center',
    [mediaQueries.mUp]: {
      fontSize: 24,
      textAlign: 'left',
    },
    [mediaQueries.sDown]: {
      fontSize: 18,
    },
  }),
  info: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 20,
    lineHeight: 1.3,
    marginTop: 24,
    [mediaQueries.sDown]: {
      fontSize: 18,
    },
    [mediaQueries.mUp]: {
      marginTop: 24,
    },
  }),
  logo: css({
    maxWidth: '80%',
    width: '200',
    [mediaQueries.sDown]: {
      width: 180,
    },
    [mediaQueries.mUp]: {
      width: 240,
    },
  }),
}
