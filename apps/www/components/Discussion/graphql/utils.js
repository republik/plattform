import { errorToString } from '../../../lib/utils/errors'

// Convert the Error object into a string, but keep the Promise rejected.
export const toRejectedString = (e) => Promise.reject(errorToString(e))
