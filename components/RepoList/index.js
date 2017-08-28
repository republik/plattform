import React, { Component } from 'react'
import {compose} from 'redux'
import withT from '../../lib/withT'
import { Link } from '../../lib/routes'
import { Interaction, linkRule } from '@project-r/styleguide'
import List from '../List'

class RepoList extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  render () {
    const { t } = this.props
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
      </div>
    )
  }
}

export default compose(
  withT
)(RepoList)
