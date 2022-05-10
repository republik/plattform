import { Component } from 'react'

const queue = []

let running = 0
const concurrency = 10

const checkPending = () => {
  if (running < concurrency && queue.length) {
    queue.shift()()
    running += 1
  }
}
const loadEnded = () => {
  running -= 1
  checkPending()
}

const loadedSrcs = new Set()
const loadImage = (src) => {
  return new Promise((resolve) => {
    const job = () => {
      const img = new window.Image()
      img.onerror = () => {
        resolve()
      }
      img.onload = () => {
        loadedSrcs.add(src)
        resolve()
      }
      img.src = src
    }
    queue.push(job)
    checkPending()
  }).then(() => {
    loadEnded()
  })
}

class QueuedImg extends Component {
  constructor(props, ...args) {
    super(props, ...args)
    this.state = {}
    this.loadSrc = (src) => {
      if (!loadedSrcs.has(src)) {
        loadImage(src).then(() => {
          if (!this.ignore) {
            this.setState({ loadedSrc: src })
          }
        })
      }
    }
  }
  componentDidMount() {
    this.loadSrc(this.props.src)
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.props.src) {
      this.loadSrc(nextProps.src)
    }
  }
  componentWillUnmount() {
    this.ignore = true
  }
  render() {
    const { src } = this.props
    const { loadedSrc } = this.state

    return loadedSrc === src || loadedSrcs.has(src) ? (
      <img {...this.props} />
    ) : null
  }
}

export default QueuedImg
