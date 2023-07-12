import React from 'react'

import { matchZone } from '@republik/mdast-react-render'
import StoryComponent from '@republik/story-loader'

import { ResizableContainer } from './Container'

export const createStoryComponent = ({ t }) => ({
  matchMdast: matchZone('STORY_COMPONENT'),
  component: ({
    showException,
    raw = false,
    size,
    attributes,
    name,
    ...props
  }) => (
    <ResizableContainer
      attributes={attributes}
      raw={raw}
      size={size}
      t={t}
      showException={showException}
    >
      <StoryComponent {...props} name={name} />
    </ResizableContainer>
  ),
  props: (node) => node.data,
  editorModule: 'storycomponent',
  editorOptions: {
    type: 'STORYCOMPONENT', // why do we need this?
    insertTypes: ['PARAGRAPH'],
    insertButtonText: 'Story Component',
  },
  isVoid: true,
})
