import createNewsletterSchema from '../schema'

import Container from './Container'
import Cover, { CoverImage } from './Cover'
import Center from './Center'
import Figure, { Image, Caption, Byline } from './Figure'

const createSchema = ({ ...args } = {}) => {
  return createNewsletterSchema({
    Container,
    Cover,
    CoverImage,
    Center,
    Figure,
    Image,
    Caption,
    Byline,
    ...args
  })
}

export default createSchema
