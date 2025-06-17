import type { MetaRecord } from 'nextra'

export default {
  '*': {
    type: 'page',
  },
  index: {
    title: 'Introduction',
    display: 'hidden',
  },
  software: {
    title: 'Software',
  },
  ux: {
    title: 'UX Guidelines',
  },
  'design-system': {
    title: 'Design System',
  },
  components: {
    title: 'Components',
  },
  about: {
    display: 'hidden',
  },
  playground: {
    display: 'hidden',
  },
} satisfies MetaRecord
