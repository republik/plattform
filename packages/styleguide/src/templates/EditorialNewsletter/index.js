import Center from '../../components/Center'
import {
  FigureByline,
  FigureCaption,
  FigureCover,
  FigureImage,
} from '../../components/Figure'
import { List, ListItem } from '../../components/List'
import { Sub, Sup } from '../../components/Typography'
import { A, P, Subhead } from '../../components/Typography/Editorial'
import Button from './components/Button'

import Container from './components/Container'
import StyledFigure from './components/Figure'
import ListP from './components/ListP'
import createNewsletterSchema from './schema'

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
