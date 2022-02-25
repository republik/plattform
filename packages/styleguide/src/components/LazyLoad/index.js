import React, { Component } from 'react'
import { rafDebounce } from '../../lib/helpers'
import debounce from 'lodash/debounce'

const checkVisible = () => {
  const height = window.innerHeight
  const scrollY = window.pageYOffset
  const scrollYEdge = scrollY + height

  instances.all.forEach((instance) => {
    if (!instance.state.visible) {
      if (instance.y - instance.props.offset * height < scrollYEdge) {
        instance.setState({
          visible: true,
        })
      }
    }
  })
}
const onScroll = rafDebounce(() => {
  checkVisible()
  recalculateLazyLoads()
})

const onResize = rafDebounce(() => {
  const scrollY = window.pageYOffset
  instances.all.forEach((instance) => {
    if (instance.ref) {
      const rect = instance.ref.getBoundingClientRect()
      instance.y = rect.top + scrollY
    } else {
      instance.y = undefined
    }
  })

  checkVisible()
})
export const recalculateLazyLoads = debounce(onResize, 1000)

const instances = {
  add(instance) {
    if (!instances.all.length) {
      window.addEventListener('scroll', onScroll)
      window.addEventListener('resize', onResize)
    }
    instances.all.push(instance)
    onResize()
  },
  rm(instance) {
    instances.all.splice(instances.all.indexOf(instance), 1)
    if (!instances.all.length) {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  },
  all: [],
}

class LazyLoad extends Component {
  constructor(...args) {
    super(...args)
    this.state = {}
    this.setRef = (ref) => {
      this.ref = ref
    }
  }
  componentDidMount() {
    instances.add(this)
  }
  componentWillUnmount() {
    instances.rm(this)
  }
  render() {
    const {
      children,
      attributes,
      style,
      type: Element,
      consistentPlaceholder,
    } = this.props
    const visible = this.props.visible || this.state.visible
    if (visible && !consistentPlaceholder) {
      return <>{children}</>
    }
    return (
      <Element ref={this.setRef} {...attributes} style={style}>
        {visible ? (
          children
        ) : consistentPlaceholder ? (
          <noscript>{children}</noscript>
        ) : null}
      </Element>
    )
  }
}

LazyLoad.defaultProps = {
  offset: 0.5,
  type: 'div',
  consistentPlaceholder: false,
}

export default LazyLoad
