import React from 'react'
import {
  ElementFormProps,
  FlyerAuthorElement,
} from '../../../../../custom-types'
import AuthorSearch from '../../../../../Forms/AuthorSearch'
import { A, Label } from '../../../../../../Typography'
import { useRenderContext } from '../../../../../Render/Context'

// TODO: domain name from env variable?
const Form: React.FC<ElementFormProps<FlyerAuthorElement>> = ({
  element,
  onChange,
}) => {
  const { Link } = useRenderContext()
  return (
    <div>
      {!!element.resolvedAuthor && (
        <Label>
          Verlinkte Autorin:{' '}
          <Link
            href={`https://republik.ch/~${element.resolvedAuthor?.slug}`}
            passhref
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <A href={`https://republik.ch/~${element.resolvedAuthor?.slug}`}>
              {element.resolvedAuthor.name}
            </A>
          </Link>
        </Label>
      )}
      <AuthorSearch
        onChange={({ value }) => {
          onChange({ authorId: value.id, resolvedAuthor: value })
        }}
      />
    </div>
  )
}

export default Form
