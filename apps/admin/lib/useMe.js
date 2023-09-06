import { useQuery } from '@apollo/client'
import { ME_QUERY } from './withMe'

export function useMe() {
  const { data } = useQuery(ME_QUERY)

  return {
    me: data?.me,
  }
}
