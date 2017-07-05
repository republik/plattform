import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import { Field, R } from '@project-r/styleguide'
import { Row, Column } from './Grid'

const UserTableForm = (props: any) => {
  return (
    <Row flex="1 1 100%">
      <Column justifyContent="center" flex="0 1 50px">
        <R />
      </Column>
      <Column
        justifyContent="center"
        flex="0 1 240px"
        as="form"
      >
        <Field label="Search..." />
      </Column>
    </Row>
  )
}

export default UserTableForm
