import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FlyerAuthorElement,
  ResolvedAuthor,
} from '../../../../custom-types'
import AuthorSearch from '../../../../AuthorSearch'

export const FlyerAuthor: React.FC<{
  resolvedAuthor?: ResolvedAuthor
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, resolvedAuthor, ...props }) => (
  <div {...attributes} {...props}>
    <div
      contentEditable={false}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '15px 0',
        opacity: resolvedAuthor ? 1 : 0.4,
      }}
    >
      {resolvedAuthor?.portrait && (
        <img
          style={{ marginRight: 15 }}
          src={resolvedAuthor.portrait}
          width='50'
          height='50'
        />
      )}
      <span
        style={{
          fontWeight: 300,
          fontFamily: 'GT America',
          fontSize: 16,
          textTransform: 'uppercase',
        }}
      >
        {resolvedAuthor?.name || 'Unresolved Author'}
      </span>
    </div>
    {children}
  </div>
)

const Form: React.FC<ElementFormProps<FlyerAuthorElement>> = ({
  element,
  onChange,
}) => (
  <div>
    AUTHOR FORM
    <br />
    ID: {element.authorId}
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
