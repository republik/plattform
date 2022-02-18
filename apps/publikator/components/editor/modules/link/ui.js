import { Text } from 'slate'
import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import {
  Label,
  Field,
  Autocomplete,
  InlineSpinner,
} from '@project-r/styleguide'
import LinkIcon from 'react-icons/lib/fa/chain'
import UIForm from '../../UIForm'
import createOnFieldChange from '../../utils/createOnFieldChange'
import RepoSearch from '../../utils/RepoSearch'
import { AutoSlugLinkInfo } from '../../utils/github'
import withT from '../../../../lib/withT'
import gql from 'graphql-tag'
import debounce from 'lodash/debounce'

import { createInlineButton, matchInline, buttonStyles } from '../../utils'

const getUsers = gql`
  query getUsers($search: String!) {
    users(search: $search, hasPublicProfile: true) {
      firstName
      lastName
      email
      id
      portrait
    }
  }
`

const UserItem = ({ user }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <div
      style={{
        width: 54,
        height: 54,
        backgroundColor: '#E2E8E6',
        backgroundImage: user.portrait ? `url(${user.portrait})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        marginRight: 10,
        flexShrink: 0,
      }}
    />
    <div>
      {user.lastName && (
        <span>
          {user.firstName} {user.lastName}
          <br />
        </span>
      )}
      <small>{user.email}</small>
    </div>
  </div>
)

const ConnectedAutoComplete = graphql(getUsers, {
  skip: (props) => !props.filter,
  options: ({ search }) => ({ variables: { search } }),
  props: ({ data }) => ({
    data: data,
    items:
      data.loading ||
      data.users.slice(0, 5).map((user) => ({
        value: user,
        element: <UserItem user={user} />,
      })),
  }),
})((props) => (
  <span style={{ position: 'relative', display: 'block' }}>
    <Autocomplete key='autocomplete' {...props} />
    {props.data?.loading && (
      <span
        style={{
          position: 'absolute',
          top: '21px',
          right: '0px',
          zIndex: 500,
        }}
      >
        <InlineSpinner size={35} />
      </span>
    )}
  </span>
))

const SearchUserForm = withT(
  class extends Component {
    constructor(...args) {
      super(...args)
      this.state = {
        items: [],
        filter: '',
        search: '',
        value: null,
      }
      this.filterChangeHandler = this.filterChangeHandler.bind(this)
      this.changeHandler = this.changeHandler.bind(this)
      this.setSearchValue = debounce(this.setSearchValue.bind(this), 500)
    }

    componentWillUnmount() {
      this.setSearchValue.cancel()
    }

    setSearchValue() {
      this.setState({
        search: this.state.filter,
      })
    }

    filterChangeHandler(value) {
      this.setState(
        (state) => ({
          ...this.state,
          filter: value,
        }),
        this.setSearchValue,
      )
    }

    changeHandler(value) {
      this.setState(
        (state) => ({
          filter: null,
          value: null,
        }),
        () => this.props.onChange(value),
      )
    }

    render() {
      const { filter, value, search } = this.state
      return (
        <ConnectedAutoComplete
          label={this.props.t(
            'metaData/field/authors',
            undefined,
            'Autor suchen',
          )}
          filter={filter}
          value={value}
          items={[]}
          search={search}
          onChange={this.changeHandler}
          onFilterChange={this.filterChangeHandler}
        />
      )
    }
  },
)

const createForm =
  (options) =>
  ({ value, onChange }) => {
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
    const authorChange = (onChange, value, node) => (author) => {
      onChange(
        value.change().replaceNodeByKey(node.key, {
          type: TYPE,
          kind,
          data: node.data.merge({
            title: `${author.value.firstName} ${author.value.lastName}`,
            href: `/~${author.value.id}`,
          }),
          nodes: [
            Text.create(`${author.value.firstName} ${author.value.lastName}`),
          ],
        }),
      )
    }
    const repoChange = (onChange, value, node) => (item) => {
      onChange(
        value.change().setNodeByKey(node.key, {
          data: node.data.merge({
            title: item.text,
            href: `https://github.com/${item.value.id}?autoSlug`,
          }),
        }),
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
  },
)

const createLink = (options) =>
  createInlineButton({
    type: options.TYPE,
    parentTypes: options.parentTypes,
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

export default (options) => {
  return {
    forms: [createForm(options)],
    textFormatButtons: [createLink(options)],
  }
}
