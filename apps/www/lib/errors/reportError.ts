let lastError: Error | string | undefined

export const reportError = async (context: string, error: Error | string) => {
  // do not track server side
  if (typeof window === 'undefined') {
    return
  }

  // avoid double reporting from window.onerror
  if (lastError?.toString().trim() === error.toString().trim()) {
    return
  }

  lastError = error
  const buildId = process.env.BUILD_ID

  console.error(error)

  await fetch('/api/reportError', {
    method: 'POST',
    body: `${context}\n${window.location.href}\n${
      buildId ? `(buildId: ${buildId})\n` : ''
    }${error}`,
  })
}
