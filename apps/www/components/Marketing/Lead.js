import { css } from 'glamor'
import { Logo, mediaQueries, fontStyles, colors } from '@project-r/styleguide'
import { useTranslation } from '../../lib/withT'

export default function LeadSection() {
  const { t } = useTranslation()
  return (
    <div {...styles.container}>
      <div {...styles.logo}>
        <Logo fill={colors.dark.text} />
      </div>
      <p {...styles.lead}>{t('marketing/page/lead/subtitle')}</p>
      <p {...styles.info}>{t('marketing/page/lead/info')}</p>
    </div>
  )
}

const styles = {
  container: css({
    maxWidth: 440,
    color: colors.dark.text,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [mediaQueries.mUp]: {
      alignItems: 'left',
    },
  }),
  lead: css({
    ...fontStyles.serifRegular,
    fontSize: 32,
    lineHeight: '40px',
    marginBottom: 0,
    textAlign: 'center',
    [mediaQueries.mUp]: {
      fontSize: 40,
      lineHeight: '50px',
      textAlign: 'left',
    },
  }),
  info: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 24,
    marginTop: 40,
  }),
  logo: css({
    width: '80%',
    [mediaQueries.mUp]: {
      width: 400,
    },
  }),
}
