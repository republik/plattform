import createNewsletterSchema from '../schema'

import { H2 } from './Headlines'
import Paragraph, { A } from './Paragraph'
import Container from './Container'
import Cover, { CoverImage } from './Cover'
import Center from './Center'
import Figure, { Image, Caption, Byline } from './Figure'
import { Sub, Sup } from './SubSup'
import { Button } from '../../shared/email/components/Button'
import List, { ListItem } from './List'

const createNewsletterEmailSchema = ({ ...args } = {}) => {
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
    A,
    ...args,
    variableContext: args.variableContext || {
      firstName: 'FNAME',
      lastName: 'LNAME',
      groups: {
        hasAccess: 'Customer:Member,Geteilter Zugriff',
      },
      _mergeTags: true,
    },
  })
}

export default createNewsletterEmailSchema
