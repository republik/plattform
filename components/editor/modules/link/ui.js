import { Text } from 'slate'
import React, { Component} from 'react'
import { gql, graphql } from 'react-apollo'
import { Label, Field, Autocomplete } from '@project-r/styleguide'
import LinkIcon from 'react-icons/lib/fa/chain'
import UIForm from '../../UIForm'
import createOnFieldChange from '../../utils/createOnFieldChange'
import RepoSearch from '../../utils/RepoSearch'
import { AutoSlugLinkInfo } from '../../utils/github'
import withT from '../../../../lib/withT'

import {
  createInlineButton,
  matchInline,
  buttonStyles
} from '../../utils'

const usersQuery = gql`
query users($search: String!) {
  users(search: $search, role: "editor") {
    firstName
    lastName
    id
  }
}
`
const ConnectedAutoComplete = graphql(usersQuery, {
  skip: props => !props.filter,
  options: ({ filter }) => ({ variables: { search: filter } }),
  props: ({ data: { users = [] } }) => ({
    items: users.slice(0, 5).map(v => ({
      value: v.id,
      text: `${v.firstName} ${v.lastName}`
    }))
  })
})(Autocomplete)

const SearchUserForm = withT(class extends Component {
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
        })
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
    const { filter, value } = this.state
    return (
      <ConnectedAutoComplete
        label={this.props.t('metaData/field/authors', undefined, 'Autor suchen')}
        filter={filter}
        value={value}
        items={[]}
        onChange={this.changeHandler}
        onFilterChange={this.filterChangeHandler}
        />
    )
  }
})

const Form = options => ({ value, onChange, t }) => {
  const { TYPE } = options

  if (!value.inlines.some(matchInline(TYPE))) {
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
  const repoChange = (onChange, value, node) => repo => {
    onChange(
      value.change().setNodeByKey(
        node.key,
        {
          data: node.data.merge({
            title: repo.text,
            href: `https://github.com/${repo.value.id}?autoSlug`
          })
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
            <UIForm key={`link-form-${i}`}>
              <Field
                label={t(`metaData/field/href`, undefined, 'href')}
                value={node.data.get('href')}
                onChange={onInputChange('href')}
              />
              <AutoSlugLinkInfo
                value={node.data.get('href')}
                label={t('metaData/field/href/document')} />
              <Field
                label={t(`metaData/field/title`, undefined, 'title')}
                value={node.data.get('title')}
                onChange={onInputChange('title')}
              />
              <SearchUserForm onChange={authorChange(onChange, value, node)} />
              <RepoSearch
                label={t('link/repo/search')}
                onChange={repoChange(onChange, value, node)}
               />
            </UIForm>
          )
        })
    }
  </div>
}

export const LinkForm = options => withT(Form(options))

export const LinkButton = options =>
  createInlineButton({
    type: options.TYPE
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

export default options => {
  return {
    forms: [LinkForm(options)],
    textFormatButtons: [LinkButton(options)]
  }
}
