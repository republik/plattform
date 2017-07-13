import * as React from 'react'
import { Field, Label } from '@project-r/styleguide'

export interface FormProps {
  [key: string]: any
  onSearch: (value: string) => void
  search?: string
}

const searchHandler = (
  handler: (value: string) => void
) => (event: any, value: string) => {
  handler(value)
}

export default ({
  search,
  onSearch,
  ...props
}: FormProps) =>
  <div>
    <Field
      label="Search"
      value={search}
      onChange={searchHandler(onSearch)}
    />
  </div>
