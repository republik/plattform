import React, { Component } from 'react'
import {compose} from 'redux'
import { css } from 'glamor'
import { gql, graphql } from 'react-apollo'

import withT from '../../lib/withT'
import { Router, Link } from '../../lib/routes'
import slugify from '../../lib/utils/slug'

import {
  Interaction,
  Field, Button,
  linkRule,
  mediaQueries
} from '@project-r/styleguide'

import Loader from '../Loader'
import List from '../List'

const styles = {
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
    margin: '0 auto'
  }),
  input: css({
    width: '100%',
    [mediaQueries.mUp]: {
      marginRight: 10,
      marginBottom: 0,
      width: '58%'
    }
  }),
  button: css({
    width: '100%',
    [mediaQueries.mUp]: {
      width: '38%',
      minWidth: 160
    }
  })
}

class RepoList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      title: ''
    }
  }
  onSubmit (event) {
    event.preventDefault()

    const { title, error } = this.state
    if (error || !title) {
      this.handleTitle(title, true)
      return
    }
    const slug = [
      'newsletter',
      slugify(title)
    ].join('-')

    Router.replaceRoute('repo/edit', {
      repoId: ['orbiting', slug],
      commitId: 'new',
      title
    })
  }
  handleTitle (value, shouldValidate) {
    const { t } = this.props

    this.setState({
      title: value,
      dirty: shouldValidate,
      error: (
        value.trim().length <= 0 && t('repo/list/add/titleField/error')
      )
    })
  }
  render () {
    const { t, data } = this.props
    const { title, dirty, error } = this.state
    return (
      <Loader loading={data.loading} error={data.error} render={() => (
        <div>
          <Interaction.H1>{t('repo/list/title')}</Interaction.H1>
          <List>
            {data.repos
              // ToDo: mv filter to backend
              .filter(repo => repo.id.match(/^orbiting\/(test|newsletter)/))
              .map(repo => (
                <List.Item key={repo.id}>
                  <Link route='repo/tree' params={{repoId: repo.id.split('/')}}>
                    <a {...linkRule}>
                      {repo.id}
                    </a>
                  </Link>
                </List.Item>
              ))
            }
            <List.Item>
              <Link route='lorem'>
                <a {...linkRule}>
                  Statisches Beispiel: Lorem
                </a>
              </Link>
            </List.Item>
          </List>

          <br /><br />

          <Interaction.H2>{t('repo/list/add/title')}</Interaction.H2>
          <form {...styles.form} onSubmit={e => this.onSubmit(e)}>
            <div {...styles.input}>
              <Field
                label={t('repo/list/add/titleField/label')}
                value={title}
                onChange={(_, value, shouldValidate) => {
                  this.handleTitle(value, shouldValidate)
                }}
                error={dirty && error}
              />
            </div>
            <div {...styles.button}>
              <Button block>
                {t('repo/list/add/submit')}
              </Button>
            </div>
          </form>
        </div>
      )} />
    )
  }
}

const query = gql`
query repos {
  repos(first: 100) {
    id
  }
}
`

export default compose(
  withT,
  graphql(query)
)(RepoList)
