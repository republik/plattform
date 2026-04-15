/**
 * Timeout for a given duration and then return resolve or rejects the promise
 * @param ms
 */
export async function timeout(ms: number, shouldReject = false): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (shouldReject) {
        reject()
      } else {
        resolve()
      }
    }, ms)
  })
}

export default timeout
