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


const createSchema = ({ ...args } = {}) => {
  return createNewsletterSchema({
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
