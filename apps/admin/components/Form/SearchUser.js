import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { Autocomplete, Interaction, Label } from '@project-r/styleguide'

import withT from '../../lib/withT'

const usersQuery = gql`
  query users($search: String) {
    users: adminUsers(limit: 5, search: $search) {
      count
      items {
        id
        name
        email
        firstName
        lastName
      }
    }
  }
`
const ConnectedAutoComplete = graphql(usersQuery, {
  skip: (props) => !props.filter,
  options: ({ filter }) => ({
    variables: { search: filter },
  }),
  props: ({ data: { users: { items } = { items: [] } } }) => {
    return {
      items: items.map((v) => ({
        value: v,
        text: v.email,
      })),
    }
  },
})(Autocomplete)

export class SearchUser extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      items: [],
      filter: '',
      value: null,
    }
    this.filterChangeHandler = this.filterChangeHandler.bind(this)
    this.changeHandler = this.changeHandler.bind(this)
  }

  filterChangeHandler(value) {
    this.setState(() => ({
      filter: value,
    }))
  }

  changeHandler(value) {
    this.setState(
      () => ({
        value: value,
      }),
      () => this.props.onChange(value),
    )
  }

  render() {
    const { filter, value } = this.state
    const user = value && value.value
    return (
      <div>
        <ConnectedAutoComplete
          label={this.props.label}
          filter={filter}
          value={value}
          items={[]}
          onChange={this.changeHandler}
          onFilterChange={this.filterChangeHandler}
        />
        <Interaction.P style={{ minHeight: '40px' }}>
          {user && (
            <Label>
              {user.firstName && user.firstName}
              {user.lastName && ` ${user.lastName}`}
              {user.username && ` | ${user.username}`}
              {user.address &&
                user.address.postalCode &&
                ` | ${user.address.postalCode}`}
              {user.address && user.address.city && ` ${user.address.city}`}
            </Label>
          )}
        </Interaction.P>
      </div>
    )
  }
}

export default withT(SearchUser)
