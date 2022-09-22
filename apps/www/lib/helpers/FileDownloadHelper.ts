/**
 * Load a blob into an url object and start the download
 * @param blob The blob to download
 * @param fileName The name of the file to download
 */
export async function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchorElement = document.createElement('a')
  anchorElement.href = objectUrl
  anchorElement.style.display = 'none'
  anchorElement.setAttribute('download', fileName)
  document.body.appendChild(anchorElement)
  anchorElement.click()
  // Cleanup
  document.body.removeChild(anchorElement)
  URL.revokeObjectURL(objectUrl)
}

/**
 * Download a file from an url with the given name.
 * @param url The url to download from
 * @param fileName The name of the file to download
 */
export async function downloadFileFromUrl(url: string, fileName: string) {
  const data = await fetch(url, {
    method: 'GET',
  })
  const blob = await data.blob()
  return downloadBlob(blob, fileName || url)
}
