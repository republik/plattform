import compose from 'lodash/flowRight'
import HeaderComponent from './Header'
import { createTile, createContainer } from './Grid'
import { colors } from '@project-r/styleguide'
import { css } from '@republik/theme/css'

// export const Body = compose(
//   createTile(
//     {
//       flex: '1 1 auto',
//     },
//     {
//       style: {
//         width: '100vw',
//         height: '100vh',
//       },
//     },
//   ),
//   createContainer({
//     direction: 'column',
//     justifyContent: 'stretch',
//     wrap: 'nowrap',
//   }),
// )('div')

export const Body = (props) => {
  return (
    <div
      {...props}
      className={css({
        minHeight: '100vh',
      })}
    ></div>
  )
}

export const Header = HeaderComponent

export const Content = (props) => (
  <div {...props} className={css({ p: '4' })}></div>
)
