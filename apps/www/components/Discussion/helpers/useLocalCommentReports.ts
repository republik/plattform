import { useEffect, useState } from 'react'
import createPersistedState from '../../../lib/hooks/use-persisted-state'
import Nullable from '../../../lib/types/Nullable'

const LOCAL_COMMENT_REPORTS_STORAGE_KEY = 'local-comment-reports'
const LOCAL_COMMENT_REPORTS_TTL = 1000 * 60 * 60 * 24 * 30 // 30 days

function parseCommentReports(data: Nullable<string>): Record<string, Date> {
  try {
    if (data != null && JSON.parse(data) instanceof Object) {
      const parsedData = JSON.parse(data)
      return Object.keys(parsedData).reduce((acc, key) => {
        const parsedDate = new Date(parsedData[key])
        if (
          new Date().getTime() - parsedDate.getTime() <
          LOCAL_COMMENT_REPORTS_TTL
        ) {
          acc[key] = new Date(parsedData[key])
        }
        return acc
      }, {})
    }
  } catch (e) {
    return {}
  }
}

function serializeCommentReports(data: Record<string, Date>): string {
  const serializedData = Object.keys(data).reduce((acc, key) => {
    acc[key] = data[key].toISOString()
    return acc
  }, {})
  return JSON.stringify(serializedData)
}

const usePersistedSerializedLocalCommentReports = createPersistedState<
  string | null
>(LOCAL_COMMENT_REPORTS_STORAGE_KEY)

export function useLocalCommentReports() {
  const [rawReports, setRawData] =
    usePersistedSerializedLocalCommentReports<Nullable<string>>(null)
  const [reports, setReports] = useState<Record<string, Date>>({})

  // sync data from local storage
  useEffect(() => {
    if (rawReports) {
      setReports(parseCommentReports(rawReports))
    }
  }, [rawReports])

  function addLocalCommentReport(commentId: string): boolean {
    const newData = {
      ...reports,
      [commentId]: new Date(),
    }
    setReports(newData)
    setRawData(serializeCommentReports(newData))
    return true
  }

  return {
    addLocalCommentReport,
    checkIfAlreadyReported: (commentId: string) =>
      Object.keys(reports).includes(commentId),
  }
}
