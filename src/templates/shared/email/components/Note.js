import React from 'react'
import { Note as WebNote } from '../../../../components/Typography/Editorial'

export const Note = ({ children }) => <>{children}</>

// todo: make email safe
export const NoteParagraph = ({ children, attributes }) => {
  return <WebNote attributes={attributes}>{children}</WebNote>
}

export default NoteParagraph
