import { Text } from 'slate'
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
    firstName
    lastName
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
  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  filterChangeHandler (value) {
    if (this._isMounted) {
      this.setState(
        state => ({
          ...this.state,
          filter: value
        }),
        () => this.loadUsers()
      )
    }
  }

  loadUsers () {
    this.props.client
      .query({
        query: usersQuery,
        variables: { search: this.state.filter }
      })
      .then(
        ({ data }) => {
          if (this._isMounted) {
            this.setState(state => ({
              ...this.state,
              items: data.users.slice(0, 5).map(v => ({
                value: v.id,
                text: `${v.firstName} ${v.lastName}`
              }))
            }))
          }
        }
      )
      .catch(
        error => {
          throw error
        }
      )
  }

  changeHandler (value) {
    if (this._isMounted) {
      this.setState(
        state => ({
          ...this.state,
          value: null
        }),
        () => this.props.onChange(value)
      )
    }
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
    const authorChange = (onChange, value, node) => author => {
      onChange(
        value.change().replaceNodeByKey(
          node.key,
          {
            type: TYPE,
            kind: 'inline',
            data: node.data.merge({
              title: author.text,
              href: `/~${author.value}`
            }),
            nodes: [
              Text.create(author.text)
            ]
          }
        )
      )
    }
    return <div>
      <Label>Links</Label>
      {
        value.inlines
          .filter(matchInline(TYPE))
          .map((node, i) => {
            const onInputChange = handlerFactory(node)
            return (
              <SidebarForm key={`link-form-${i}`}>
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
                <ConnectedSearchUserForm onChange={authorChange(onChange, value, node)} />
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
