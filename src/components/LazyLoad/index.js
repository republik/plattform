import React, { Component } from 'react'

var supportsPassive = false
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true
    }
  })
  window.addEventListener('testPassive', null, opts)
  window.removeEventListener('testPassive', null, opts)
} catch (e) {}

const onFrame = fn => {
  let next

  return (...args) => {
    if (!next) {
      next = window.requestAnimationFrame(() => {
        next = undefined
        fn(...args)
      })
    }
  }
}

const checkVisible = () => {
  const height = window.innerHeight
  const scrollY = window.pageYOffset
  const scrollYEdge = scrollY + height

  instances.all.forEach(instance => {
    if (!instance.state.visible) {
      if (instance.y - instance.props.offset * height < scrollYEdge) {
        instance.setState({
          visible: true
        })
      }
    }
  })
}
const onScroll = onFrame(checkVisible)

const onResize = onFrame(() => {
  const scrollY = window.pageYOffset
  
  instances.all.forEach(instance => {
    if (instance.ref) {
      const rect = instance.ref.getBoundingClientRect()
      instance.y = rect.top + scrollY
    } else {
      instance.y = undefined
    }
  })
  
  checkVisible()
})

const instances = {
  add(instance) {
    if (!instances.all.length) {
      const opts = supportsPassive ? { passive: true } : false
      window.addEventListener('scroll', onScroll, opts)
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
  all: []
}

class LazyLoad extends Component {
  constructor(...args) {
    super(...args)
    this.state = {}
    this.setRef = ref => {
      this.ref = ref
    }
  }
  componentDidMount() {
    instances.add(this)
  }
  componentWillUnmount() {
    instances.rm(this)
  }
  render () {
    const { children, attributes, style } = this.props
    const visible = this.props.visible || this.state.visible
    return (
      <span ref={this.setRef} {...attributes} style={style}>
        {visible ? children : null}
        {!visible && !process.browser && <noscript>
          {children}
        </noscript>}
      </span>
    )
  }
}

LazyLoad.defaultProps = {
  offset: 0.5
}

export default LazyLoad
