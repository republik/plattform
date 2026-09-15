import ElectionDiscussionPage from '@/components/Vote/Legacy/ElectionDiscussionPage'
import compose from 'lodash/flowRight'
import { enforceMembership } from '@/components/Auth/withMembership'
import withMe from '@/lib/apollo/withMe'
import { defaultServerSideProps } from '@/lib/apollo/helpers'

export default compose(enforceMembership(), withMe)(ElectionDiscussionPage)

export const getServerSideProps = defaultServerSideProps
