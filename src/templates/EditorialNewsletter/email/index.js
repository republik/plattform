import createSchema from '../schema'

import Container from './Container'
import Cover, { CoverImage } from './Cover'
import Paragraph, { Strong, Em, Link, Br } from './Paragraph'
import Center from './Center'
import { H2 } from './Headlines'
import Figure, { Image, Caption, Byline } from './Figure'
import Blockquote, { BlockquoteText, BlockquoteSource } from './Blockquote'
import List, { ListItem } from './List'

export default createSchema({
  Container,
  Cover,
  CoverImage,
  Paragraph,
  Strong,
  Em,
  Link,
  Br,
  Center,
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
