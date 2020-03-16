import createNewsletterSchema from '../schema'

import { H2 } from './Headlines'
import Paragraph from './Paragraph'
import Container from './Container'
import Cover, { CoverImage } from './Cover'
import Center from './Center'
import Figure, { Image, Caption, Byline } from './Figure'
import { Sub, Sup } from './SubSup'
import { Button } from './Button'
import List, { ListItem } from './List'

const createSchema = ({ ...args } = {}) => {
  return createNewsletterSchema({
    H2,
    Paragraph,
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
    List,
    ListItem,
    ...args
  })
}

export default createSchema
