import React, { Component } from 'react'
import {compose} from 'redux'
import {css} from 'glamor'

import withT from '../../lib/withT'
import { Link } from '../../lib/routes'

import {
  Interaction,
  Field, Button,
  linkRule,
  mediaQueries
} from '@project-r/styleguide'

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
    this.state = {}
  }
  onSubmit (event) {
    event.preventDefault()
  }
  handleTitle (value, shouldValidate) {
    const { t } = this.props

    this.setState({
      title: value,
      dirty: shouldValidate,
      error: (
        value.trim().length <= 0 && t('repoList/add/titleField/error')
      )
    })
  }
  render () {
    const { t } = this.props
    const { title, dirty, error } = this.state
    return (
      <div>
        <Interaction.H1>{t('repoList/title')}</Interaction.H1>
        <List>
          {[].map(repo => (
            <List.Item>
              <Link route='editor/tree' params={{repository: repo.id}}>
                <a {...linkRule}>
                  {repo.id}
                </a>
              </Link>
            </List.Item>
          ))}
          <List.Item>
            <Link route='lorem'>
              <a {...linkRule}>
                Statisches Beispiel: Lorem
              </a>
            </Link>
          </List.Item>
        </List>

        <br /><br />

        <Interaction.H2>{t('repoList/add/title')}</Interaction.H2>
        <form {...styles.form} onSubmit={e => this.onSubmit(e)}>
          <div {...styles.input}>
            <Field
              label={t('repoList/add/titleField/label')}
              value={title}
              onChange={(_, value, shouldValidate) => {
                this.handleTitle(value, shouldValidate)
              }}
              error={dirty && error}
            />
          </div>
          <div {...styles.button}>
            <Button block>
              {t('repoList/add/submit')}
            </Button>
          </div>
        </form>
      </div>
    )
  }
}

export default compose(
  withT
)(RepoList)
