import createNewsletterSchema from '../schema'

import Container from './Container'
import Cover, { CoverImage } from './Cover'
import Center from './Center'
import Figure, { Image, Caption, Byline } from './Figure'
import { Sub, Sup } from './SubSup'
import { Button } from './Button'

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
    Sub,
    Sup,
    Button,
    ...args
  })
}

export default createSchema
