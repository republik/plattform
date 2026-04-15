import { AudioQueueItem } from '../types/AudioPlayerItem'

function downloadAudioSourceFile(item: AudioQueueItem['document']) {
  const {
    meta: { audioSource },
  } = item
  const downloadSource = audioSource.mp3 || audioSource.aac || audioSource.ogg

  const anchorElement = document.createElement('a')
  anchorElement.style.display = 'none'
  anchorElement.href = downloadSource + '?download=1'
  anchorElement.download = ''
  anchorElement.target = '_blank'
  anchorElement.textContent = 'Download'
  document.body.appendChild(anchorElement)
  anchorElement.click()
  // Cleanup
  document.body.removeChild(anchorElement)
}

export default downloadAudioSourceFile
