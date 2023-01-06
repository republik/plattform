import { css } from 'glamor'
import {
  useColorContext,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'
import Button from '../shared/Button'
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
        <ClimateLabLogo width={600} height={600} />
      </div>
      <div {...styles.content} {...colorScheme.set('color', 'text')}>
        <h3 {...styles.text}>
          {t.elements('ClimateTeaser/content/text1', {
            br1: <br key='1' />,
            br2: <br key='2' />,
          })}
        </h3>
        <div style={{ maxWidth: 'max-content' }}>
          <Button
            href={
              isClimateLabMember ? CLIMATE_LAB_URL : CLIMATE_LAB_LANDINGPAGE_URL
            }
          >
            {t('ClimateTeaser/content/buttonAction')}
          </Button>
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

const frontTabletBreakpoint = '@media only screen and (min-width: 1850px)'

const styles = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 2rem 5rem 2rem',
  }),
  img: css({
    width: '80%',
    display: 'inline-flex',
    justifyContent: 'center',
  }),
  imgWrapper: css({
    flex: '0 1 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  content: css({
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }),
  text: css({
    ...fontStyles.serifTitle,
    fontSize: 38,
    lineHeight: '1.3em',
    textAlign: 'center',
    marginTop: '3rem',
    marginBottom: '3rem',
    [mediaQueries.mUp]: {
      fontSize: 58,
    },
    [frontTabletBreakpoint]: {
      fontSize: 80,
    },
  }),
}
