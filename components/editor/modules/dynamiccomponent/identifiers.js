import Placeholder from './Placeholder'

const identifiers = new Proxy(
  {},
  {
    get: () => {
      return Placeholder
    }
  }
)
export default identifiers
