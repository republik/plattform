import createNewsletterSchema from './schema'

import Container from './components/Container'
import StyledFigure from './components/Figure'
import Button from './components/Button'
import ListP from './components/ListP'

import Center from '../../components/Center'
import {
  FigureCover,
  FigureImage,
  FigureCaption,
  FigureByline,
} from '../../components/Figure'
import { Sub, Sup } from '../../components/Typography'
import { P, Subhead, A } from '../../components/Typography/Editorial'
import { List, ListItem } from '../../components/List'

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
