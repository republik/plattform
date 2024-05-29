import { css } from 'glamor'

import TrialForm from '../Trial/Form'
import { useColorContext, Center } from '@project-r/styleguide'

import BrowserOnly from './BrowserOnly'
import { TrialPaynote } from '@app/app/(campaign)/components/trial-paynote'

const styles = {
  container: css({
    padding: 13,
  }),
}

const InlineWrapper = ({ inline, children }) => {
  if (inline) {
    return <Center>{children}</Center>
  } else {
    return children
  }
}

// TODO: REMOVE AFTER CAMPAIGN
const TrialPayNoteMini = ({ context }) =>
  context === 'after' ? (
    <TrialPaynote />
  ) : (
    <TrialPaynote variant={context === 'navigation' ? 'mini' : 'regular'} />
  )

// const TrialPayNoteMini = ({ repoId, inline, context, index }) => {
//   const [colorScheme] = useColorContext()

//   return (
//     <div
//       data-hide-if-active-membership='true'
//       {...colorScheme.set('backgroundColor', 'default')}
//       {...styles.container}
//     >
//       <InlineWrapper inline={inline}>
//         <BrowserOnly
//           Component={TrialForm}
//           componentProps={{
//             minimal: true,
//             titleBlockKey: 'series',
//             payload: {
//               repoId,
//               variation: 'tryNoteMini/210613',
//               position: [context, inline ? 'inline' : 'grid', index]
//                 .filter(Boolean)
//                 .join('-'),
//             },
//             onSuccess: () => {
//               return false
//             },
//             isInSeriesNav: true,
//           }}
//           height={115}
//         />
//       </InlineWrapper>
//     </div>
//   )
// }

export default TrialPayNoteMini
