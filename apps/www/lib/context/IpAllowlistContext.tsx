'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useQuery } from '@apollo/client'
import { IpAllowlistAccessDocument } from '#graphql/republik-api/__generated__/gql/graphql'

type IpAllowlistContextValues = {
  allowlistName: string | null
  hasAllowlistAccess: boolean
  loading: boolean
}

const IpAllowlistContext = createContext<IpAllowlistContextValues>({
  allowlistName: null,
  hasAllowlistAccess: false,
  loading: true,
})

export const useIpAllowlist = () => useContext(IpAllowlistContext)

export const IpAllowlistProvider = ({ children }: { children: ReactNode }) => {
  const { data, loading } = useQuery(IpAllowlistAccessDocument)
  
  const allowlistName = data?.ipAllowlistAccess?.name ?? null
  
  return (
    <IpAllowlistContext.Provider value={{
      allowlistName,
      hasAllowlistAccess: !!allowlistName,
      loading,
    }}>
      {children}
    </IpAllowlistContext.Provider>
  )
}

export default IpAllowlistProvider

