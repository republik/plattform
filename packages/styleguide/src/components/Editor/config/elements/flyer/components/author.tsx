import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FlyerAuthorElement,
} from '../../../../custom-types'
import AuthorSearch from '../../../../AuthorSearch'
import { Label } from '../../../../../Typography'

const Form: React.FC<ElementFormProps<FlyerAuthorElement>> = ({
  element,
  onChange,
}) => (
  <div>
    <Label>Author Id</Label>
    {element.authorId}
    <AuthorSearch
      onChange={({ value }) => {
        onChange({ authorId: value.id, resolvedAuthor: value })
      }}
    />
  </div>
)

export const config: ElementConfigI = {
  component: 'flyerAuthor',
  Form,
  props: ['authorId', 'resolvedAuthor'],
  attrs: {
    isVoid: true,
    highlightSelected: true,
  },
}
