import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import NextHead from 'next/head'
import { ApolloError, useQuery } from '@apollo/client'
import { checkRoles, meQuery } from '../apollo/withMe'
import { css } from 'glamor'
import { getInitials } from '../../components/Frame/User'

const HAS_ACTIVE_MEMBERSHIP_ATTRIBUTE = 'data-has-active-membership'
const HAS_ACTIVE_MEMBERSHIP_STORAGE_KEY = 'me.hasActiveMembership'

const ME_PORTRAIT_ATTRIBUTE = 'data-me-portrait'
export const ME_PORTRAIT_STORAGE_KEY = 'me.portraitOrInitials'

const IS_CLIMATELAB_MEMBER_ATTRIBUTE = 'data-is-climatelab-member'
const IS_CLIMATELAB_MEMBER_STORAGE_KEY = 'me.isClimatelabMember'

const CLIMATELAB_ONLY_ITEM_ATTRIBUTE = 'data-climatelab-only'

// Rule to hide elements while a statically generated page is fetching the active-user
css.global(`[${ME_PORTRAIT_ATTRIBUTE}="true"] [data-hide-if-me="true"]`, {
  display: 'none',
})

css.global('[data-show-if-me="true"]', {
  display: 'none',
})

css.global(`[${ME_PORTRAIT_ATTRIBUTE}="true"] [data-show-if-me="true"]`, {
  display: 'block',
})

css.global(
  `[${HAS_ACTIVE_MEMBERSHIP_ATTRIBUTE}="true"] [data-hide-if-active-membership="true"]`,
  {
    display: 'none',
  },
)

css.global('[data-show-if-active-membership="true"]', {
  display: 'none',
})

css.global(
  `[${HAS_ACTIVE_MEMBERSHIP_ATTRIBUTE}="true"] [data-show-if-active-membership="true"]`,
  {
    display: 'block',
  },
)

// Climate-lab global styles

css.global(
  `[${IS_CLIMATELAB_MEMBER_ATTRIBUTE}="true"] [${CLIMATELAB_ONLY_ITEM_ATTRIBUTE}="true"]`,
  {
    display: 'block',
  },
)

// Hide climate-lab only items for non-climate-lab members

css.global(`[${CLIMATELAB_ONLY_ITEM_ATTRIBUTE}="true"]`, {
  display: 'none',
})

export type MeObjectType = {
  id: string
  username: string
  name: string
  initials: string
  firstName: string
  lastName: string
  email: string
  portrait: string
  roles: string[]
  isListed: boolean
  hasPublicProfile: boolean
  discussionNotificationChannels: string[]
  accessCampaigns: { id: string }[]
  prolongBeforeDate: string
  activeMembership: {
    id: string
    type: {
      name: string
    }
    endDate: string
    graceEndDate: string
  }
  progressConsent: boolean
}

type MeResponse = {
  me: MeObjectType | null
}

type MeContextValues = {
  me?: MeObjectType
  meLoading: boolean
  meError?: ApolloError
  meRefetch: any
  hasActiveMembership: boolean
  hasAccess: boolean
  isEditor: boolean
  isClimateLabMember: boolean
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
  const { data, loading, error, refetch } = useQuery<MeResponse>(meQuery, {})

  const me = data?.me
  const isMember = checkRoles(me, ['member'])
  const isClimateLabMember = checkRoles(me, ['climate'])
  const hasActiveMembership = !!me?.activeMembership
  const portraitOrInitials = me ? me.portrait ?? getInitials(me) : false

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
        hasAccess: !data && assumeAccess ? assumeAccess : isMember,
        isEditor: checkRoles(me, ['editor']),
        isClimateLabMember,
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
