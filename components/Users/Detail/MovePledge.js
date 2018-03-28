import React, { Component } from 'react'
import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  OverlayToolbarClose,
  Interaction,
  Label
} from '@project-r/styleguide'
import SearchUser from '../../Form/SearchUser'
import { swissTime } from '../../../lib/utils/formats'

const dateTimeFormat = swissTime.format(
  '%e. %B %Y %H.%M Uhr'
)

export default class MovePledge extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
      user: null
    }

    this.userChangeHandler = ({ value }) => {
      this.setState(() => ({ user: value }))
    }

    this.closeHandler = () => {
      this.setState(() => ({ user: null, isOpen: false }))
    }

    this.submitHandler = () => {
      this.setState(() => ({ user: null, isOpen: false }))
      this.props.onSubmit({
        pledgeId: this.props.pledge.id,
        userId: this.state.user.id
      })
    }
  }

  render() {
    const { isOpen, user } = this.state
    const { pledge } = this.props
    return (
      <div
        style={{
          display: 'inline-block'
        }}
      >
        <Button
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          Move pledge
        </Button>

        {isOpen && (
          <Overlay onClose={this.closeHandler}>
            <OverlayToolbar>
              <OverlayToolbarClose
                onClick={this.closeHandler}
              />
            </OverlayToolbar>
            <OverlayBody>
              <Interaction.H2>
                Pledge verschieben
              </Interaction.H2>
              <br />
              <Interaction.H3>
                {pledge.package.name.split('_').join(' ')} –{' '}
                {dateTimeFormat(new Date(pledge.createdAt))}{' '}
                – {pledge.status}
                <br />
                <Label>
                  Created:{' '}
                  {dateTimeFormat(
                    new Date(pledge.createdAt)
                  )}
                  {' – '}
                  Updated:{' '}
                  {dateTimeFormat(
                    new Date(pledge.updatedAt)
                  )}
                </Label>
              </Interaction.H3>
              <SearchUser
                label="User auswählen"
                value={user}
                onChange={this.userChangeHandler}
              />
              <Interaction.P style={{ minHeight: '40px' }}>
                {user && (
                  <Label>
                    {user.email}
                    {user.username && ` | ${user.username}`}
                    {user.address &&
                      user.address.postalCode &&
                      ` | ${user.address.postalCode}`}
                    {user.address &&
                      user.address.city &&
                      ` ${user.address.city}`}
                  </Label>
                )}
              </Interaction.P>
              <Button
                primary
                disabled={!user}
                onClick={this.submitHandler}
              >
                Speichern
              </Button>
            </OverlayBody>
          </Overlay>
        )}
      </div>
    )
  }
}
