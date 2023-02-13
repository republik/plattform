import SubmissionsOverview from '../components/Questionnaire/Submissions/Overview'

import {
  colors,
  fontStyles,
  mediaQueries,
  useColorContext,
  ColorContextProvider,
  Center,
} from '@project-r/styleguide'

import { css } from 'glamor'

import Frame from '../components/Frame'

// import { PUBLIC_BASE_URL } from '../../../lib/constants'
import { climateColors } from '../components/Climatelab/config'

const KlimafragebogenPage = () => {
  const [colorScheme] = useColorContext()

  // const meta = {
  //   pageTitle: t('ClimateLandingPage/seo/title'),
  //   title: t('ClimateLandingPage/seo/title'),
  //   description: t('ClimateLandingPage/seo/description'),
  //   image: CLIMATE_LAB_SHARE_IMAGE_URL,
  //   url: `${PUBLIC_BASE_URL}/wilkommen-zum-klimalabor`,
  // }

  return (
    <Frame
      // meta={meta}
      containerMaxWidth={1000}
      customContentColorContext={climateColors}
    >
      <Center>
        <SubmissionsOverview slug={'sommer22'} />
      </Center>
    </Frame>
  )
}

export default KlimafragebogenPage
