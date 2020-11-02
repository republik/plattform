import createNewsletterSchema from '../schema'

import Container from './Container'
import StyledFigure from './Figure'
import Button from './Button'
import ListP from './ListP'

import Center from '../../../components/Center'
import {
  FigureCover,
  FigureImage,
  FigureCaption,
  FigureByline
} from '../../../components/Figure'
import { Sub, Sup } from '../../../components/Typography'
import { P, Subhead, A } from '../../../components/Typography/Editorial'
import { List, ListItem } from '../../../components/List'

const createSchema = ({ ...args } = {}) => {
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
    ...args
  })
}

export default createSchema
