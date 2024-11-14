import createNewsletterSchema from '../../templates/EditorialNewsletter/schema'

import Container from './Container'
import StyledFigure from './Figure'
import Button from './Button'
import ListP from './ListP'

import Center from '../Center'
import {
  FigureCover,
  FigureImage,
  FigureCaption,
  FigureByline,
} from '../Figure'
import { Sub, Sup } from '../Typography'
import { P, Subhead, A } from '../Typography/Editorial'
import { List, ListItem } from '../List'

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
