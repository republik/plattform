import { compose } from 'redux'
import React, { Component} from 'react'
import { gql, withApollo } from 'react-apollo'
import { Label, Field, Autocomplete } from '@project-r/styleguide'
import LinkIcon from 'react-icons/lib/fa/chain'
import SidebarForm from '../../SidebarForm'
import createOnFieldChange from '../../utils/createOnFieldChange'
import withT from '../../../../lib/withT'

import {
  createInlineButton,
  matchInline,
  createPropertyForm,
  buttonStyles
} from '../../utils'

export const usersQuery = gql`
query users($search: String!) {
  users(search: $search, role: "editor") {
    name
    id
  }
}
`
export class SearchUserForm extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      items: [],
      filter: '',
      value: null
    }
    this.filterChangeHandler = this.filterChangeHandler.bind(this)
    this.changeHandler = this.changeHandler.bind(this)
  }

  filterChangeHandler (value) {
    this.setState(
      state => ({
        ...this.state,
        filter: value
      }),
      () => this.loadUsers()
    )
  }

  loadUsers () {
    this.props.client
      .query({
        query: usersQuery,
        variables: { search: this.state.filter }
      })
      .then(
        ({ data }) => {
          console.log(data)
          this.setState(state => ({
            ...this.state,
            items: data.users.map(v => ({
              value: v.id,
              text: v.name
            }))
          }))
        }
      )
      .catch(
        error => {
          throw error
        }
      )
  }

  changeHandler (value) {
    this.setState(
      state => ({
        ...this.state,
        value: null
      }),
      () => this.props.onChange(value)
    )
  }

  render () {
    const { items, filter, value } = this.state
    return (
      <Autocomplete
        label={this.props.t('metaData/field/authors', undefined, 'Autor suchen')}
        items={items}
        filter={filter}
        value={value}
        onChange={this.changeHandler}
        onFilterChange={this.filterChangeHandler}
        />
    )
  }
}

const ConnectedSearchUserForm = withT(withApollo(SearchUserForm))

export default ({TYPE}) => {
  const LinkButton = createInlineButton({
    type: TYPE
  })(
    ({ active, disabled, visible, ...props }) =>
      <span
        {...buttonStyles.mark}
        {...props}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
        >
        <LinkIcon />
      </span>
  )

  const Form = ({ disabled, value, onChange, t }) => {
    if (disabled) {
      return null
    }
    const handlerFactory = createOnFieldChange(onChange, value)
    return <div>
      <Label>Links</Label>
      {
        value.inlines
          .filter(matchInline(TYPE))
          .map((node, i) => {
            const onInputChange = handlerFactory(node)
            return (
              <SidebarForm>
                <Field
                  label={t(`metaData/field/href`, undefined, 'href')}
                  value={node.data.get('href')}
                  onChange={onInputChange('href')}
                />
                <Field
                  label={t(`metaData/field/title`, undefined, 'title')}
                  value={node.data.get('title')}
                  onChange={onInputChange('title')}
                />
                <ConnectedSearchUserForm onChange={v => console.log(v)} />
              </SidebarForm>
            )
          })
      }
    </div>
  }

  const LinkForm = compose(
    createPropertyForm({
      isDisabled: ({ value }) => {
        return !value.inlines.some(matchInline(TYPE))
      }
    }),
    withT
  )(Form)

  return {
    forms: [LinkForm],
    textFormatButtons: [LinkButton]
  }
}
