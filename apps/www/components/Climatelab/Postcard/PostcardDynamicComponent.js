import React from 'react'

import { Interaction } from '@project-r/styleguide'

import PostcardGenerator from './PostcardGenerator'
import { useMe } from '../../../lib/context/MeContext'

const PostcardDynamicComponent = () => {
  const { me, meLoading } = useMe()
  const isClimate = !meLoading && me?.roles.includes('climate')
  return isClimate ? (
    <PostcardGenerator />
  ) : (
    <Interaction.P>
      {' Melden Sie sich zuerst fürs Klimalabor an.'}
    </Interaction.P>
  )
}

export default PostcardDynamicComponent
