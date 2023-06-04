import React from 'react'
import {
  ElementFormProps,
  FlyerAuthorElement,
} from '../../../../../custom-types'
import AuthorSearch from '../../../../../Forms/AuthorSearch'
import Field from '../../../../../../Form/Field'
import { Transforms } from 'slate'
import { useSlate } from 'slate-react'
import IconButton from '../../../../../../IconButton'
import { IconDeleteOutline } from '@republik/icons'

const Form: React.FC<ElementFormProps<FlyerAuthorElement>> = ({
  element,
  path,
  onChange,
}) => {
  const editor = useSlate()
  return (
    <div>
      {element.resolvedAuthor ? (
        <Field
          label='Ausgewählte Autorin'
          value={element.resolvedAuthor?.name}
          disabled
          icon={
            element.resolvedAuthor && (
              <IconButton
                Icon={IconDeleteOutline}
                onClick={() => {
                  Transforms.unsetNodes(
                    editor,
                    ['authorId', 'resolvedAuthor'],
                    {
                      at: path,
                    },
                  )
                }}
                size={30}
              />
            )
          }
        />
      ) : (
        <AuthorSearch
          onChange={({ value }) => {
            onChange({
              authorId: value.id,
              // explicit mapping to avoid leaking to the tree
              // - e.g. value.email
              // - tree will eventually be published
              resolvedAuthor: {
                name: value.name,
                slug: value.slug,
                portrait: value.portrait,
              },
            })
          }}
        />
      )}
    </div>
  )
}

export default Form
