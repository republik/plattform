import * as React from 'react'
import { Component } from 'react'
import { css } from 'glamor'
import withData from '../lib/withData'
import withMe from '../lib/withMe'
import App from '../components/App'
import SignIn from '../components/Auth/SignIn'
import { Body, Content } from '../components/Layout'
import { Interaction, Logo } from '@project-r/styleguide'
import { Router } from '../routes'

const styles = {
  center: css({
    width: '100%',
    maxWidth: '500px',
    margin: '20vh auto'
  })
}

const goToUsers = ({ me }: any) => {
  if (me) {
    Router.replaceRoute('users')
  }
}

interface AnyObject {
  [key: string]: any
}

class Index extends Component<AnyObject, AnyObject> {
  public componentDidUpdate() {
    goToUsers(this.props)
  }
  public componentDidMount() {
    goToUsers(this.props)
  }
  public render() {
    return (
      <App>
        <Body>
          <Content>
            <div {...styles.center}>
              <div
                style={{ maxWidth: 300, marginBottom: 60 }}
              >
                <Logo />
                <Interaction.H2>Admin</Interaction.H2>
              </div>
              <SignIn />
            </div>
          </Content>
        </Body>
      </App>
    )
  }
}

export default withData(withMe(Index))
