'use client'
import { createContext, ReactNode, useContext, useEffect } from 'react'
import NextHead from 'next/head'
import { ApolloError, useQuery } from '@apollo/client'
import { checkRoles } from '../apollo/withMe'
import { css } from 'glamor'
import { getInitials } from '../../components/Frame/User'
import {
  MeDocument,
  MeQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { OPEN_ACCESS } from 'lib/constants'

const HAS_ACTIVE_MEMBERSHIP_ATTRIBUTE = 'data-has-active-membership'
const HAS_ACTIVE_MEMBERSHIP_STORAGE_KEY = 'me.hasActiveMembership'

const ME_PORTRAIT_ATTRIBUTE = 'data-me-portrait'
export const ME_PORTRAIT_STORAGE_KEY = 'me.portraitOrInitials'

const IS_CLIMATELAB_MEMBER_ATTRIBUTE = 'data-is-climatelab-member'
const IS_CLIMATELAB_MEMBER_STORAGE_KEY = 'me.isClimatelabMember'

const CLIMATELAB_ONLY_ITEM_ATTRIBUTE = 'data-climatelab-only'

// Rule to hide elements while a statically generated page is fetching the active-user
css.global(`:root[${ME_PORTRAIT_ATTRIBUTE}="true"] [data-hide-if-me="true"]`, {
  display: 'none !important',
})

css.global(':root [data-show-if-me="true"]', {
  display: 'none !important',
})

css.global(`:root[${ME_PORTRAIT_ATTRIBUTE}="true"] [data-show-if-me="true"]`, {
  display: 'block !important',
})

css.global(
  `:root[${HAS_ACTIVE_MEMBERSHIP_ATTRIBUTE}="true"] [data-hide-if-active-membership="true"]`,
  {
    display: 'none !important',
  },
)

css.global(':root [data-show-if-active-membership="true"]', {
  display: 'none !important',
})

css.global(
  `:root[${HAS_ACTIVE_MEMBERSHIP_ATTRIBUTE}="true"] [data-show-if-active-membership="true"]`,
  {
    display: 'block !important',
  },
)

// Climate-lab global styles

css.global(
  `:root[${IS_CLIMATELAB_MEMBER_ATTRIBUTE}="true"] [${CLIMATELAB_ONLY_ITEM_ATTRIBUTE}="true"]`,
  {
    display: 'block !important',
  },
)

// Hide climate-lab only items for non-climate-lab members

css.global(`:root [${CLIMATELAB_ONLY_ITEM_ATTRIBUTE}="true"]`, {
  display: 'none !important',
})

export type MeObjectType = MeQuery['me']

export type TrialStatusType =
  | 'MEMBER' // could also be null
  | 'TRIAL_ELIGIBLE'
  | 'TRIAL_GROUP_A'
  | 'TRIAL_GROUP_B'
  | 'TRIAL_GROUP_TEILEN'
  | 'NOT_TRIAL_ELIGIBLE'

type MeContextValues = {
  me?: MeObjectType
  meLoading: boolean
  meError?: ApolloError
  meRefetch: any
  hasActiveMembership: boolean
  hasAccess: boolean
  isMember: boolean
  isEditor: boolean
  isClimateLabMember: boolean
  trialStatus?: TrialStatusType
  progressConsent: boolean
}

const getTrialStatus = (me?: MeObjectType | undefined): TrialStatusType => {
  // anonymous user: de facto eligible for trial
  if (!me) return 'TRIAL_ELIGIBLE'

  // has membership or active Abo teilen etc: not relevant for trial
  // important: trial users have the member role, too, but they don't have a subscription
  if (me.activeMembership || me.activeMagazineSubscription) return 'MEMBER'

  // In trial user:
  // We use the first character of the user id to assign a trial group.
  // The character is either a number [0-9] or a letter [a-f].
  // [0-7] -> group A, [8-f] -> group B
  if (me.regwallTrialStatus === 'Active') {
    const firstChar = me.id[0]
    return ['0', '1', '2', '3', '4', '5', '6', '7'].includes(firstChar)
      ? 'TRIAL_GROUP_A' // in trial user, AB-test group A
      : 'TRIAL_GROUP_B' // in trial user, AB-test group B
  }

  // abo teilen user: have the member role and should see the magazine
  if (me.roles?.includes('member')) return 'TRIAL_GROUP_TEILEN'

  // logged-in user, has done a "regwall" trial: not eligible for trial
  if (me.regwallTrialStatus === 'Past') return 'NOT_TRIAL_ELIGIBLE'

  // logged-in user, hasn't done a "regwall" trial yet: eligible for trial
  if (!me.regwallTrialStatus) return 'TRIAL_ELIGIBLE'
}

const MeContext = createContext<MeContextValues>({} as MeContextValues)

export const useMe = (): MeContextValues => useContext(MeContext)

type Props = {
  children: ReactNode
  /**
   * Assumes that a memberships exists, even before me is loaded.
   * All values returned from the context that correlate to a membership will be set to true.
   */
  assumeAccess?: boolean
}

const MeContextProvider = ({ children, assumeAccess = false }: Props) => {
  const { data, loading, error, refetch } = useQuery(MeDocument, {})

  const me = data?.me
  const isMember = checkRoles(me, ['member'])
  const isClimateLabMember = checkRoles(me, ['climate'])
  const hasActiveMembership =
    !!me?.activeMembership || !!me?.activeMagazineSubscription

  const portraitOrInitials = me ? me.portrait ?? getInitials(me) : false
  const trialStatus = getTrialStatus(me)

  useEffect(() => {
    if (loading) return

    if (portraitOrInitials) {
      document.documentElement.setAttribute(ME_PORTRAIT_ATTRIBUTE, 'true')
    } else {
      document.documentElement.removeAttribute(ME_PORTRAIT_ATTRIBUTE)
    }
    if (hasActiveMembership) {
      document.documentElement.setAttribute(
        HAS_ACTIVE_MEMBERSHIP_ATTRIBUTE,
        'true',
      )
    } else {
      document.documentElement.removeAttribute(HAS_ACTIVE_MEMBERSHIP_ATTRIBUTE)
    }

    try {
      if (portraitOrInitials) {
        localStorage.setItem(ME_PORTRAIT_STORAGE_KEY, portraitOrInitials)
      } else {
        localStorage.removeItem(ME_PORTRAIT_STORAGE_KEY)
      }

      if (hasActiveMembership) {
        localStorage.setItem(
          HAS_ACTIVE_MEMBERSHIP_STORAGE_KEY,
          String(hasActiveMembership),
        )
      } else {
        localStorage.removeItem(HAS_ACTIVE_MEMBERSHIP_STORAGE_KEY)
      }

      // eslint-disable-next-line no-empty
    } catch (e) {}
  }, [loading, portraitOrInitials, hasActiveMembership])

  useEffect(() => {
    try {
      if (loading) return
      if (isClimateLabMember) {
        localStorage.setItem(IS_CLIMATELAB_MEMBER_STORAGE_KEY, 'true')
        document.documentElement.setAttribute(
          IS_CLIMATELAB_MEMBER_ATTRIBUTE,
          'true',
        )
      } else {
        localStorage.setItem(IS_CLIMATELAB_MEMBER_STORAGE_KEY, 'false')
        document.documentElement.removeAttribute(IS_CLIMATELAB_MEMBER_ATTRIBUTE)
      }
    } catch (e) {}
  }, [isClimateLabMember, loading])

  return (
    <MeContext.Provider
      value={{
        me: me,
        meLoading: loading,
        meError: error,
        meRefetch: refetch,
        hasActiveMembership,
        hasAccess: OPEN_ACCESS
          ? true
          : !data && assumeAccess
          ? assumeAccess
          : isMember,
        isMember: isMember,
        isEditor: checkRoles(me, ['editor']),
        isClimateLabMember,
        trialStatus,
        progressConsent: me?.progressOptOut !== true,
      }}
    >
      <NextHead>
        <script
          dangerouslySetInnerHTML={{
            __html: [
              'try{',
              `var isMember = localStorage.getItem("${HAS_ACTIVE_MEMBERSHIP_STORAGE_KEY}");`,
              `if (isMember === "true")`,
              `document.documentElement.setAttribute("${HAS_ACTIVE_MEMBERSHIP_ATTRIBUTE}", isMember);`,
              `if (localStorage.getItem("${ME_PORTRAIT_STORAGE_KEY}"))`,
              `document.documentElement.setAttribute("${ME_PORTRAIT_ATTRIBUTE}", "true");`,
              `var isClimateLabMember = localStorage.getItem("${IS_CLIMATELAB_MEMBER_STORAGE_KEY}");`,
              `if (isClimateLabMember === "true")`,
              `document.documentElement.setAttribute("${IS_CLIMATELAB_MEMBER_ATTRIBUTE}", isClimateLabMember); `,
              '} catch(e) {console.error(e)}',
            ].join(''),
          }}
        />
      </NextHead>
      {children}
    </MeContext.Provider>
  )
}

export default MeContextProvider
