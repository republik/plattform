import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { Mso } from 'mdast-react-render/lib/email'
import Header from './Header'
import SG from '../../../theme/env'

const styles = {
  container: {
    fontFamily: 'serif',
    fontSize: 18,
    color: '#000',
    WebkitFontSmoothing: 'antialiased',
    backgroundColor: '#fff',
    width: '100%'
  }
}

class DocumentContainer extends Component {
  constructor(props, ...args) {
    super(props, ...args)

    this.subscriptions = []
    this.subscribe = f => this.subscriptions.push(f)
    this.unsubscribe = f => {
      this.subscriptions = this.subscriptions.filter(
        subscription => subscription !== f
      )
    }
    this.makeMetaContext = ({ meta }) => ({
      meta: {
        ...(meta.toJS ? meta.toJS() : meta),
        subscribe: this.subscribe,
        unsubscribe: this.unsubscribe
      }
    })
    this.state = this.makeMetaContext(props)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.meta !== this.props.meta) {
      this.setState(this.makeMetaContext(nextProps), () => {
        this.subscriptions.forEach(f => f())
      })
    }
  }
  getChildContext() {
    const { meta } = this.state
    return {
      meta
    }
  }
  render() {
    const { children } = this.props
    return (
      <div
        {...css(styles.container)}
        style={{ margin: 0, padding: 0, backgroundColor: '#fff' }}
      >
        <style
          type="text/css"
          dangerouslySetInnerHTML={{
            __html: `
        ${SG.FONT_FACES}
        mso{
          display: none;
        }
      `
          }}
        />
        <Mso>
          {`
        <div>
          <table cellspacing="0" cellpadding="0" border="0" width="800">
            <tr>
              <td>
        `}
        </Mso>
        <table border="0" cellPadding="0" cellSpacing="0" width="100%">
          <tbody>
            <Header />
            {children}
          </tbody>
        </table>
        <Mso>
          {`
              </td>
            </tr>
          </table>
        </div>
        `}
        </Mso>
      </div>
    )
  }
}

DocumentContainer.childContextTypes = {
  meta: PropTypes.object
}

export default DocumentContainer
