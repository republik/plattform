import React, { Component } from 'react'
import debounce from 'lodash.debounce'

const withDebouncedSearch = (BaseComponent) =>
  class WithDebouncedSearch extends Component {
    constructor(props) {
      super(props)
      this.state = {
        search: props.defaultSearch || '',
      }

      this.debouncedOnSearch = debounce((...args) => {
        this.props.onSearch(...args)
      }, 400)
      this.onSearch = (search) => {
        this.setState({ search })
        this.debouncedOnSearch(search)
      }
    }
    render() {
      const { search } = this.state

      return (
        <BaseComponent
          {...this.props}
          search={search}
          onSearch={this.onSearch}
        />
      )
    }
  }

export default withDebouncedSearch
