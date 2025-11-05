import { useEffect, useMemo, useState } from 'react'
import createPersistedState from '../../../lib/hooks/use-persisted-state'
import Nullable from '../../../lib/types/Nullable'

const LOCAL_COMMENT_REPORTS_STORAGE_KEY = 'local-comment-reports'
const LOCAL_COMMENT_REPORTS_TTL = 1000 * 60 * 60 * 24 * 30 // 30 days

/**
 * Parses the raw comment-reports from local storage and returns a map of comment ids to the date of the report
 * @param data The raw comment-reports from local storage
 * @returns A map of comment ids to the date of the report
 */
function parseCommentReports(data: Nullable<string>): Record<string, Date> {
  try {
    if (data != null && JSON.parse(data) instanceof Object) {
      const parsedData = JSON.parse(data)
      return Object.keys(parsedData).reduce((acc, key) => {
        acc[key] = new Date(parsedData[key])
        return acc
      }, {})
    }
  } catch (e) {
    return {}
  }
}

/**
 * Serializes the comment-reports map to a string that can be stored in local storage
 * @param data The comment-reports map
 * @returns The serialized comment-reports map
 */
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

/**
 * Checks if any of the reports in the map are older than the TTL
 * @param reports The comment-reports map
 * @returns True if any of the reports are older than the TTL, false otherwise
 */
function hasOutdatedReports(reports: Record<string, Date>): boolean {
  return Object.keys(reports).some((key) => {
    const parsedDate = new Date(reports[key])
    return (
      new Date().getTime() - parsedDate.getTime() > LOCAL_COMMENT_REPORTS_TTL
    )
  })
}

type useLocalCommentReportsValues = {
  addLocalCommentReport: (commentId: string) => boolean
  checkIfAlreadyReported: (commentId: string) => boolean
}

/**
 * A hook that provides functions for adding and checking comment reports stored in the local-storage
 * @returns An object containing the following properties:
 * - addLocalCommentReport: A function that adds a comment report to local storage
 * - checkIfAlreadyReported: A function that checks if a comment has already been reported
 */
export function useLocalCommentReports(): useLocalCommentReportsValues {
  const [rawReports, setRawReports] =
    usePersistedSerializedLocalCommentReports<Nullable<string>>(null)
  const [reports, setReports] = useState<Record<string, Date>>({})

  // sync data from local storage
  useEffect(() => {
    if (rawReports) {
      const parsedReports = parseCommentReports(rawReports)
      setReports(parsedReports)

      // Delte reports that are older than the TTL
      if (hasOutdatedReports(parsedReports)) {
        const updatedReports = Object.keys(parsedReports).reduce((acc, key) => {
          const parsedDate = new Date(parsedReports[key])
          if (
            new Date().getTime() - parsedDate.getTime() <
            LOCAL_COMMENT_REPORTS_TTL
          ) {
            acc[key] = parsedDate
          }
          return acc
        }, {})

        setRawReports(serializeCommentReports(updatedReports))
      }
    }
  }, [rawReports])

  function addLocalCommentReport(commentId: string): boolean {
    const newData = {
      ...reports,
      [commentId]: new Date(),
    }
    setReports(newData)
    setRawReports(serializeCommentReports(newData))
    return true
  }

  const checkIfAlreadyReported = useMemo(
    () => (commentId: string) => Object.keys(reports).includes(commentId),
    [reports],
  )

  return {
    addLocalCommentReport,
    checkIfAlreadyReported,
  }
}
