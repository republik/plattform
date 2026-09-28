import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'

function downloadAudioSourceFile(item: AudioQueueItemContent) {
  const downloadSource = item?.audioSourceMp3
  if (!downloadSource) {
    return
  }

  const anchorElement = document.createElement('a')
  anchorElement.style.display = 'none'
  anchorElement.href = downloadSource + '?download=1&dl=' // download=1 is for asset server, dl= for Sanity CDN
  anchorElement.download = ''
  anchorElement.target = '_blank'
  anchorElement.textContent = 'Download'
  document.body.appendChild(anchorElement)
  anchorElement.click()
  // Cleanup
  document.body.removeChild(anchorElement)
}

export default downloadAudioSourceFile
