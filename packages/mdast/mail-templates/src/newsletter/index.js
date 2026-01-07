import { Button } from '../shared/components/Button'
import Center from '../shared/components/Center'
import Container from '../shared/components/Container'
import Cover, { CoverImage } from './components/Cover'
import Figure, { Byline, Caption, Image } from './components/Figure'

import { H2 } from './components/Headlines'
import List, { ListItem } from './components/List'
import Paragraph, { A } from './components/Paragraph'
import { Sub, Sup } from './components/SubSup'
import createNewsletterSchema from './schema'

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
