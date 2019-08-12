import React from 'react'

import { storiesOf } from '@storybook/react'

import { Gallery } from '../src/components/Gallery'
import Center from '../src/components/Center'
import { P } from '../src/components/Typography/Editorial'

storiesOf('Gallery', module)
  .add('Gallery', () => (
    <Gallery
      items={[
        {
          src: 'https://picsum.photos/id/819/2000/1000',
          w: 2000,
          h: 1000,
          author: 'Hans Muster',
          title:
            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligulaeget dolor.',
        },
        {
          src: 'https://picsum.photos/id/816/1000/1000',
          w: 1000,
          h: 1000,
          author: 'Hans Muster',
          title:
            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligulaeget dolor.',
        },
      ]}
    />
  ))
