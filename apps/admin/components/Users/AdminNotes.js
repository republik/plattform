import React, { Component, Fragment } from 'react'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import {
  Interaction,
  Loader,
  Label,
  InlineSpinner,
  Button,
  Field,
  A,
} from '@project-r/styleguide'

import remark from 'remark'
import remarkReactRenderer from 'remark-react'
import TextareaAutosize from 'react-autosize-textarea'

import { swissTime } from '../../lib/utils/formats'
import withMe from '../../lib/withMe'

import ErrorMessage from '../ErrorMessage'

import { Section, SectionTitle } from '../Display/utils'

const getAdminNotes = gql`
  query user($userId: String) {
    user(slug: $userId) {
      id
      adminNotes
    }
  }
`

const updateAdminNotesMutation = gql`
  mutation updateAdminNotes($notes: String, $userId: ID!) {
    updateAdminNotes(notes: $notes, userId: $userId) {
      id
      adminNotes
    }
  }
`

const dateTimeFormat = swissTime.format('%e. %B %Y %H.%M Uhr')

class AdminNotes extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
    }
  }
  renderText(text) {
    return remark()
      .use(remarkReactRenderer, {
        remarkReactComponents: {
          h6: ({ children }) => (
            <Label
              style={{
                display: 'block',
                marginTop: '10px',
              }}
            >
              {children}
            </Label>
          ),
          p: Interaction.P,
          a: A,
        },
      })
      .processSync(text).contents
  }

  changeHandler = (e) => {
    this.setState({ message: e.target.value })
  }

  submitHandler = (e) => {
    e.preventDefault()
    if (!this.state.message.trim().length) {
      return
    }

    const notes = `
###### ${this.props.me.name} am ${dateTimeFormat(new Date())}

${this.state.message}

${this.props.data.user.adminNotes || ''}
    `.trim()

    this.setState({ saving: true })
    this.props
      .updateAdminNotes(notes)
      .then(() => {
        this.setState({
          saving: false,
          saveError: undefined,
          message: '',
        })
      })
      .catch((error) => {
        this.setState({
          saving: false,
          saveError: error,
        })
      })
  }

  render() {
    const { data } = this.props
    const { saveError, saving } = this.state
    return (
      <Section>
        <SectionTitle>Interne Anmerkungen</SectionTitle>
        <Loader
          loading={data.loading}
          error={
            data.error ||
            (!data.loading && !data.user && 'Benutzer nicht gefunden')
          }
          render={() => (
            <Fragment>
              {this.renderText(data.user.adminNotes || '')}
              <Field
                value={this.state.message}
                label={'Anmerkungen'}
                onChange={this.changeHandler}
                renderInput={(props) => (
                  <TextareaAutosize {...props} style={{ lineHeight: '30px' }} />
                )}
              />
              <div style={{ textAlign: 'right' }}>
                {saving ? (
                  <InlineSpinner />
                ) : (
                  <A href='#' onClick={this.submitHandler}>
                    hinzufügen
                  </A>
                )}
              </div>
              {!!saveError && <ErrorMessage error={saveError} />}
            </Fragment>
          )}
        />
      </Section>
    )
  }
}

export default compose(
  withMe,
  graphql(getAdminNotes),
  graphql(updateAdminNotesMutation, {
    props: ({
      mutate,
      ownProps: {
        data: { user },
      },
    }) => ({
      updateAdminNotes: (notes) => {
        return mutate({
          variables: { notes, userId: user.id },
        })
      },
    }),
  }),
)(AdminNotes)
