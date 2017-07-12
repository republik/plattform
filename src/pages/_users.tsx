// import * as React from 'react'
// import { default as Routes } from '../routes'
// import { css, StyleAttribute } from 'glamor'
// import { UserTableParams } from '../types/users'
// import withData from '../lib/withData'
// import App from '../components/App'
// import UserTable from '../components/UserTable'
// import UserTableForm from '../components/UserTableForm'
// import Container from '../components/Container'
// import Header from '../components/Header'
// import Body from '../components/Body'
// import { Row, Column } from '../components/Grid'
// import { Field, R } from '@project-r/styleguide'
//
// const sortChangeHandler = (params: UserTableParams) => {
//   Routes.Router.pushRoute('users', params)
// }
//
// const searchChangeHandler = (e: any, value: string) => {
//   Routes.Router.pushRoute('users', { search: value })
// }
//
// export default withData((props: any) => {
//   return (
//     <App>
//       <Container>
//         <Header>
//           <Row flex="1 1 100%">
//             <Column justifyContent="center" flex="0 1 50px">
//               <R />
//             </Column>
//             <Column
//               justifyContent="center"
//               flex="0 1 240px"
//               as="form"
//             >
//               <Field
//                 label="Search..."
//                 value={props.url.query.search}
//                 onChange={searchChangeHandler}
//               />
//             </Column>
//           </Row>
//         </Header>
//         <Body>
//           <UserTable
//             params={props.url.query}
//             onChange={sortChangeHandler}
//           />
//         </Body>
//       </Container>
//     </App>
//   )
// })
