import createNewsletterSchema from '../schema'

import Container from './Container'
import StyledFigure from './Figure'
import Button from './Button'

import Center from '../../../components/Center'
import {
  FigureCover,
  FigureImage,
  FigureCaption,
  FigureByline
} from '../../../components/Figure'
import { Sub, Sup } from '../../../components/Typography'
import { P, Subhead } from '../../../components/Typography/Editorial'

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
    ...args
  })
}

export default createSchema
