import {
  matchIOSUserAgent,
  matchAndroidUserAgent,
  matchFirefoxUserAgent,
  matchSearchBotUserAgent,
} from '../parse-useragent'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

type UserAgentValues = {
  userAgent: string
  isIOS: boolean
  isAndroid: boolean
  isFirefox: boolean
  isSearchBot: boolean
}

export { matchIOSUserAgent, matchAndroidUserAgent, matchFirefoxUserAgent }

const UserAgentContext = createContext<UserAgentValues>(undefined)

export const useUserAgent = () => useContext(UserAgentContext)

type Props = {
  children: ReactNode
  providedValue?: string
}

const UserAgentProvider = ({ children, providedValue }: Props) => {
  const [userAgent, setUserAgent] = useState(providedValue)

  useEffect(() => {
    setUserAgent(navigator.userAgent)
  }, [])

  return (
    <UserAgentContext.Provider
      value={{
        userAgent,
        isIOS: matchIOSUserAgent(userAgent),
        isAndroid: matchAndroidUserAgent(userAgent),
        isFirefox: matchFirefoxUserAgent(userAgent),
        isSearchBot: matchSearchBotUserAgent(userAgent),
      }}
    >
      {children}
    </UserAgentContext.Provider>
  )
}

export default UserAgentProvider
