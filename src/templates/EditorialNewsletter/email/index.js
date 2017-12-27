import createNewsletterSchema from '../schema'

import Container from './Container'
import Cover, { CoverImage } from './Cover'
import Center from './Center'

const createSchema = ({ ...args } = {}) => {
  return createNewsletterSchema({
    Container,
    Cover,
    CoverImage,
    Center,
    ...args
  })
}

export default createSchema
