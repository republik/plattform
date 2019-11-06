import { Text } from 'slate'
import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import { Label, Field, Autocomplete } from '@project-r/styleguide'
import LinkIcon from 'react-icons/lib/fa/chain'
import UIForm from '../../UIForm'
import createOnFieldChange from '../../utils/createOnFieldChange'
import RepoSearch from '../../utils/RepoSearch'
import { AutoSlugLinkInfo } from '../../utils/github'
import withT from '../../../../lib/withT'
import gql from 'graphql-tag'

import { createInlineButton, matchInline, buttonStyles } from '../../utils'

const getUsers = gql`
  query getUsers($search: String!) {
    users(search: $search) {
      firstName
      lastName
      email
      id
    }
  }
`

const ConnectedAutoComplete = graphql(getUsers, {
  skip: props => !props.filter,
  options: ({ filter }) => ({ variables: { search: filter } }),
  props: ({ data: { users = [] } }) => ({
    items: users.slice(0, 5).map(v => ({
      value: v,
      text: v.email
    }))
  })
})(Autocomplete)

const SearchUserForm = withT(
  class extends Component {
    constructor(...args) {
      super(...args)
      this.state = {
        items: [],
        filter: '',
        value: null
      }
      this.filterChangeHandler = this.filterChangeHandler.bind(this)
      this.changeHandler = this.changeHandler.bind(this)
    }

    filterChangeHandler(value) {
      this.setState(state => ({
        ...this.state,
        filter: value
      }))
    }

    changeHandler(value) {
      this.setState(
        state => ({
          filter: null,
          value: null
        }),
        () => this.props.onChange(value)
      )
    }

    render() {
      const { filter, value } = this.state
      return (
        <ConnectedAutoComplete
          label={this.props.t(
            'metaData/field/authors',
            undefined,
            'Autor suchen'
          )}
          filter={filter}
          value={value}
          items={[]}
          onChange={this.changeHandler}
          onFilterChange={this.filterChangeHandler}
        />
      )
    }
  }
)

const createForm = options => ({ value, onChange }) => {
  const { TYPE } = options

  if (!value.inlines.some(matchInline(TYPE))) {
    return null
  }
  return (
    <div>
      <Label>Links</Label>
      <LinkForm
        TYPE={TYPE}
        nodes={value.inlines.filter(matchInline(TYPE))}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export const LinkForm = withT(
  ({ kind = 'inline', TYPE, nodes, value, onChange, t }) => {
    const handlerFactory = createOnFieldChange(onChange, value)
    const authorChange = (onChange, value, node) => author => {
      onChange(
        value.change().replaceNodeByKey(node.key, {
          type: TYPE,
          kind,
          data: node.data.merge({
            title: `${author.value.firstName} ${author.value.lastName}`,
            href: `/~${author.value.id}`
          }),
          nodes: [
            Text.create(`${author.value.firstName} ${author.value.lastName}`)
          ]
        })
      )
    }
    const repoChange = (onChange, value, node) => repo => {
      onChange(
        value.change().setNodeByKey(node.key, {
          data: node.data.merge({
            title: repo.text,
            href: `https://github.com/${repo.value.id}?autoSlug`
          })
        })
      )
    }

    return (
      <>
        {nodes.map((node, i) => {
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
                label={t('metaData/field/href/document')}
              />
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
        })}
      </>
    )
  }
)

const createLink = options =>
  createInlineButton({
    type: options.TYPE,
    parentTypes: options.parentTypes
  })(({ active, disabled, visible, ...props }) => (
    <span
      {...buttonStyles.mark}
      {...props}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
    >
      <LinkIcon />
    </span>
  ))

export default options => {
  return {
    forms: [createForm(options)],
    textFormatButtons: [createLink(options)]
  }
}
