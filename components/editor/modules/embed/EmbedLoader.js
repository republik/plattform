import React from 'react'
import Loader from '../../../Loader'
import { colors } from '@project-r/styleguide'
import { css } from 'glamor'
// TMP: work around for missing t
// - rm all t code here after styelguide 5.62.1
import withT from '../../../../lib/withT'

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

export default (query, Component) => {
  class EmbedLoader extends React.Component {
    constructor(props, ...args) {
      super(props, ...args)
      const { node } = props
      const hasId = node.data.has('id')
      this.state = {
        loading: !hasId,
        error:
          !hasId && !node.data.has('queryParams') && 'No embed params found.'
      }
    }

    componentDidMount() {
      const { loading, error } = this.state
      if (!loading || error) {
        return
      }

      const { node, client, editor } = this.props
      const { id, embedType } = node.data.get('queryParams')

      client
        .query({
          query,
          variables: { id, embedType }
        })
        .then(({ data }) => {
          editor.change(t =>
            t.setNodeByKey(node.key, {
              data: {
                ...data.embed,
                url: node.data.get('url')
              }
            })
          )
          this.setState({ error: null, loading: false })
        })
        .catch(error => this.setState({ error, loading: false }))
    }

    render() {
      const { loading, error } = this.state
      const { client, t, ...props } = this.props
      const { node, editor } = props
      const active = editor.value.blocks.some(block => block.key === node.key)

      return (
        <Loader
          loading={loading}
          error={error}
          render={() => {
            return (
              <div
                {...styles.border}
                {...props.attributes}
                data-active={active}
                contentEditable={false}
              >
                <Component data={node.data.set('t', t).toJS()} />
              </div>
            )
          }}
        />
      )
    }
  }

  return withT(EmbedLoader)
}
