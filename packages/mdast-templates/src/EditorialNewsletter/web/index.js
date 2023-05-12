import createNewsletterSchema from '../schema'

import Button from './Button'
import Container from './Container'
import StyledFigure from './Figure'
import ListP from './ListP'

import Center from '@project-r/styleguide/src/components/Center'
import {
  FigureByline,
  FigureCaption,
  FigureCover,
  FigureImage,
} from '@project-r/styleguide/src/components/Figure'
import { List, ListItem } from '@project-r/styleguide/src/components/List'
import { Sub, Sup } from '@project-r/styleguide/src/components/Typography'
import {
  A,
  P,
  Subhead,
} from '@project-r/styleguide/src/components/Typography/Editorial'

const createNewsletterWebSchema = ({ ...args } = {}) => {
  return createNewsletterSchema({
    H2: Subhead,
    Paragraph: P,
    Container,
    Cover: FigureCover,
    CoverImage: FigureImage,
    Center,
    Figure: StyledFigure,
    Image: FigureImage,
    Caption: FigureCaption,
    Byline: FigureByline,
    Sub,
    Sup,
    Button: Button,
    List,
    ListItem,
    ListP,
    A,
    ...args,
  })
}

export default createNewsletterWebSchema
