// mock @apollo/client
// - gql and graphql import do not work with current jest & react-scripts versions

jest.mock('@apollo/client', () => ({
  // ...jest.requireActual('@apollo/client'),
  gql: () => null,
}))
jest.mock('@apollo/client/react/hoc', () => ({
  // ...jest.requireActual('@apollo/client/react/hoc'),
  graphql: () => (Component) => Component,
}))
