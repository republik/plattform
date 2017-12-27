import createSchema from '../schema'

import Container from './Container'
import Cover, { CoverImage } from './Cover'
import Center from './Center'
import Paragraph, { Strong, Em, Link, Br } from '../email/Paragraph'
import { H2 } from '../email/Headlines'
import Figure, { Image, Caption, Byline } from '../email/Figure'
import Blockquote, { BlockquoteText, BlockquoteSource } from '../email/Blockquote'
import List, { ListItem } from '../email/List'

export default createSchema({
  Container,
  Cover,
  CoverImage,
  Center,
  Paragraph,
  Strong,
  Em,
  Link,
  Br,
  H2,
  Figure,
  Image,
  Caption,
  Byline,
  Blockquote,
  BlockquoteText,
  BlockquoteSource,
  List,
  ListItem
})
