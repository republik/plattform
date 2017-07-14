import * as React from 'react'
import { Pledge } from '../../../types/admin'
import { Container, Tile } from '../../Layout/Grid'
import { Table, Row, Cell } from '../../Layout/Table'
import { Interaction, Label } from '@project-r/styleguide'

export default ({ pledge }: { pledge: Pledge }) => {
  return (
    <div>
      <p>
        {pledge.package.name}
      </p>
      <Container direction="row" justifyContent="stretch">
        <Tile flex="0 0 50%">
          <Label>Package options</Label>
          <Table>
            {pledge.package.options.map(packageOption =>
              <Row
                key={`packageOption-${packageOption.id}`}
              >
                <Cell>
                  {packageOption.reward
                    ? packageOption.reward.name
                    : ''}
                </Cell>
                <Cell flex="0 0 100px">
                  {packageOption.price}
                </Cell>
              </Row>
            )}
          </Table>
        </Tile>
        <Tile>
          <Label>Payments</Label>
          <Table>
            {pledge.payments.map(payment =>
              <Row key={`payment-${payment.id}`}>
                <Cell flex="0 0 70px">
                  {payment.hrid}
                </Cell>
                <Cell>
                  {payment.method}
                </Cell>
                <Cell>
                  {payment.status}
                </Cell>
                <Cell>
                  {payment.dueDate}
                </Cell>
                <Cell flex="0 0 100px">
                  {payment.total}
                </Cell>
              </Row>
            )}
          </Table>
        </Tile>
      </Container>
    </div>
  )
}
