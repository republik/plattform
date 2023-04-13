import { css } from 'glamor'
import {
  useColorContext,
  plainLinkRule,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'
import NextLink from 'next/link'
import { useTranslation } from '../../../lib/withT'
import { climateColors } from '../config'
import OptionalLocalColorContext from '../../Frame/OptionalLocalColorContext'
import { useMe } from '../../../lib/context/MeContext'
import {
  CLIMATE_LAB_LANDINGPAGE_URL,
  CLIMATE_LAB_ROLE,
  CLIMATE_LAB_URL,
} from '../constants'
import ClimateLabLogo from '../shared/ClimateLabLogo'

const ClimateTeaserContent = () => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  const { me } = useMe()
  const isClimateLabMember = me?.roles?.includes(CLIMATE_LAB_ROLE)

  return (
    <div
      {...styles.wrapper}
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('color', 'text')}
    >
      <div {...styles.imgWrapper}>
        <ClimateLabLogo width={480} height={480} />
      </div>
      <div {...styles.content} {...colorScheme.set('color', 'text')}>
        <h3 {...styles.title}>
          {t.elements('ClimateTeaser/content/text1', {
            br: <br />,
            nbsp: <>&nbsp;</>,
          })}
        </h3>
        <p {...styles.text}>{t('ClimateTeaser/content/text2')}</p>
        <div style={{ maxWidth: 'max-content' }}>
          <NextLink
            href={
              isClimateLabMember ? CLIMATE_LAB_URL : CLIMATE_LAB_LANDINGPAGE_URL
            }
            passHref
            {...colorScheme.set('backgroundColor', 'primary')}
            {...colorScheme.set('color', 'climateButtonText')}
            {...colorScheme.set('borderColor', 'climateBorder')}
            {...css({
              ':hover': {
                backgroundColor: colorScheme.getCSSColor('primaryHover'),
              },
            })}
            {...plainLinkRule}
            {...styles.button}
            legacyBehavior
          >
            {t('ClimateTeaser/content/buttonAction')}
          </NextLink>
        </div>
      </div>
    </div>
  )
}

const ClimateLabTeaser = () => (
  <OptionalLocalColorContext localColorVariables={climateColors}>
    <ClimateTeaserContent />
  </OptionalLocalColorContext>
)

export default ClimateLabTeaser

export const climateLabTeaserXlBreakpoint =
  '@media only screen and (min-width: 1850px)'

const styles = {
  wrapper: css({
    display: 'grid',
    gridTemplateAreas: `
      'image'
      'content'
    `,
    gap: '4rem',
    [mediaQueries.mUp]: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateAreas: `
        'image content'
      `,
      gap: 0,
    },
    padding: '4rem 1rem',
  }),
  img: css({
    width: '80%',
    display: 'inline-flex',
    justifyContent: 'center',
  }),
  imgWrapper: css({
    gridArea: 'image',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  }),
  content: css({
    display: 'flex',
    margin: 'auto',
    flexDirection: 'column',
    gridArea: 'content',
    alignItems: 'center',
    textAlign: 'center',
    gap: '4rem',
    [mediaQueries.mUp]: {
      width: '80%',
      alignItems: 'flex-start',
      textAlign: 'center',
    },
  }),
  title: css({
    ...fontStyles.serifTitle,
    fontSize: 38,
    lineHeight: '1.3em',
    margin: '1rem 0 -0.3em 0',
    [mediaQueries.mUp]: {
      fontSize: 48,
      textAlign: 'left',
    },
    ['@media only screen and (min-width: 1350px)']: {
      fontSize: 58,
    },
    [climateLabTeaserXlBreakpoint]: {
      fontSize: 80,
    },
  }),
  text: css({
    ...fontStyles.sansSerifMedium,
    lineHeight: '1.54em',
    fontSize: 23,
    [mediaQueries.mUp]: {
      fontSize: 24,
      textAlign: 'left',
    },
    margin: 0,
  }),
  button: css({
    ...fontStyles.sansSerifBold,
    display: 'block',
    fontSize: 20,
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    [mediaQueries.mUp]: {
      fontSize: 25,
    },
    [climateLabTeaserXlBreakpoint]: {
      fontSize: 30,
    },
  }),
}
