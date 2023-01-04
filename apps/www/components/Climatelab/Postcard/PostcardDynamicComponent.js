import React from 'react'

import { Interaction, A } from '@project-r/styleguide'

import PostcardGenerator from './PostcardGenerator'
import { useMe } from '../../../lib/context/MeContext'
import { t } from '../../../lib/withT'

const PostcardDynamicComponent = () => {
  const { me, meLoading } = useMe()
  const isClimate = !meLoading && me?.roles.includes('climate')
  return isClimate ? (
    <PostcardGenerator />
  ) : (
    <Interaction.P>
      {t.elements(
        'Climatelab/Postcard/PostcardDynamicComponent/noaccess/text',
        {
          link: (
            <A
              href={t(
                'Climatelab/Postcard/PostcardDynamicComponent/noaccess/linkHref',
              )}
            >
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
