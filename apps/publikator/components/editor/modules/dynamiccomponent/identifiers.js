import Placeholder from './Placeholder'

const identifiers = new Proxy(
  {},
  {
    get: () => Placeholder
  }
)
export default identifiers
