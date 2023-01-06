import { Interaction, A } from '@project-r/styleguide'

import PostcardGenerator from './PostcardGenerator'
import { useMe } from '../../../lib/context/MeContext'
import { t } from '../../../lib/withT'
import { CLIMATE_LAB_LANDINGPAGE_URL } from '../constants'

const PostcardDynamicComponent = () => {
  const { me } = useMe()
  const isClimate = me?.roles.includes('climate')
  return isClimate ? (
    <PostcardGenerator />
  ) : (
    <Interaction.P>
      {t.elements(
        'Climatelab/Postcard/PostcardDynamicComponent/noaccess/text',
        {
          link: (
            <A href={CLIMATE_LAB_LANDINGPAGE_URL}>
              {t(
                'Climatelab/Postcard/PostcardDynamicComponent/noaccess/linkText',
              )}
            </A>
          ),
        },
      )}
    </Interaction.P>
  )
}

export default PostcardDynamicComponent
