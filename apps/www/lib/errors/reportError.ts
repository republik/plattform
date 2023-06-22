let lastError

export const reportError = async (context, error) => {
  // do not track server side
  if (typeof window === 'undefined') {
    return
  }
  // avoid double reporting from window.onerror
  if (lastError && lastError.trim() === error.trim()) {
    return
  }

  lastError = error
  const buildId = process.env.BUILD_ID

  await fetch('/api/reportError', {
    method: 'POST',
    body: `${context}\n${window.location.href}\n${
      buildId ? `(buildId: ${buildId})\n` : ''
    }${error}`,
  })
}
