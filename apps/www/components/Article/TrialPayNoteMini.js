import { css } from 'glamor'

import TrialForm from '../Trial/Form'
import { useColorContext, Center } from '@project-r/styleguide'

import BrowserOnly from './BrowserOnly'

// TODO: REMOVE AFTER CAMPAIGN
import {
  VerlegerKampagnePayNoteTop,
  VerlegerKampagnePayNoteBottom,
} from 'components/VerlegerKampagne/VerlegerKampagneBanner'

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
    <VerlegerKampagnePayNoteBottom />
  ) : (
    <VerlegerKampagnePayNoteTop inNavigation={context === 'navigation'} />
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
