import { css } from 'glamor'
import Image from 'next/image'
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
  CLIMATE_LAB_IMG_URL,
  CLIMATE_LAB_LANDINGPAGE_URL,
  CLIMATE_LAB_ROLE,
  CLIMATE_LAB_URL,
} from '../constants'
import { useRouter } from 'next/router'
import ClimateLabLogo from '../shared/ClimateLabLogo'

const ClimateTeaserContent = () => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()
  const router = useRouter()

  const { me } = useMe()
  const isClimateLabMember = me?.roles?.includes(CLIMATE_LAB_ROLE)

  const handleClick = () => {
    if (isClimateLabMember) {
      return router.push(CLIMATE_LAB_URL)
    } else {
      return router.push(CLIMATE_LAB_LANDINGPAGE_URL)
    }
  }

  console.log('colorScheme', colorScheme)

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
        <h3 {...styles.text}>
          {t.elements('ClimateTeaser/content/text1', {
            br1: <br />,
            br2: <br />,
          })}
        </h3>
        <Button onClick={handleClick}>
          {t('ClimateTeaser/content/buttonAction')}
        </Button>
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

const styles = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '4rem 2rem',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      gap: '4rem',
      padding: '4rem',
    },
  }),
  img: css({
    width: '80%',
    display: 'inline-flex',
    justifyContent: 'center',
  }),
  imgWrapper: css({
    flex: '1 1 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  content: css({
    flex: '1 1 0',
  }),
  text: css({
    ...fontStyles.serifTitle,
    fontSize: 30,
    lineHeight: '1.3em',
    [mediaQueries.mUp]: {
      fontSize: 36,
    },
  }),
}
