import React from 'react'
import Loader from '../../../Loader'
import { colors } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  border: css({
    outline: `4px solid transparent`,
    width: '100%',
    lineHeight: 0,
    transition: 'outline-color 0.2s',
    '&[data-active="true"]': {
      outlineColor: colors.primary
    },
    pointerEvents: 'none'
  })
}

export default (query, Component) => (
  class EmbedLoader extends React.Component {
    constructor (...args) {
      super(...args)
      this.state = {
        loading: false,
        error: null
      }
    }

    componentDidMount () {
      const { node, client, editor } = this.props

      if (node.data.has('id')) {
        return
      } else if (!node.data.has('url')) {
        return console.warn('No embed URL found.')
      }

      this.setState(state => ({
        loading: true,
        ...state
      }), () => {
        const url = node.data.get('url')

        client
          .query({
            query,
            variables: { url }
          })
          .then(
            ({ data }) => {
              this.setState({ error: null, loading: false })
              editor.change(t =>
                t.setNodeByKey(node.key, { data: {
                  url,
                  ...data.embed
                } })
              )
            }
          )
          .catch(
            error => this.setState({ error, loading: false })
          )
      })
    }

    render () {
      const { loading, error } = this.state
      const { client, ...props } = this.props
      const { node, editor } = props

      const active = editor.value.blocks.some(
        block => block.key === node.key
      )
      return (
        <Loader loading={loading} error={error} render={() => {
          return (
            <div
              {...styles.border}
              data-active={active}
              contentEditable={false}
              >
              <Component
                {...props}
                />
            </div>
          )
        }} />
      )
    }
  }
)
