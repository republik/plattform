import React from 'react'
import {
  ElementFormProps,
  FlyerAuthorElement,
} from '../../../../../custom-types'
import AuthorSearch from '../../../../../Forms/AuthorSearch'
import { A, Label } from '../../../../../../Typography'

const Form: React.FC<ElementFormProps<FlyerAuthorElement>> = ({
  element,
  onChange,
}) => {
  return (
    <div>
      {!!element.resolvedAuthor && (
        <Label>
          Ausgewählte Autorin:{' '}
          {element.resolvedAuthor.slug ? (
            // TODO: domain name from env variable / render context?
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <A href={`https://www.republik.ch/~${element.resolvedAuthor.slug}`}>
              {element.resolvedAuthor.name}
            </A>
          ) : (
            element.resolvedAuthor.name
          )}
        </Label>
      )}
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
    </div>
  )
}

export default Form
