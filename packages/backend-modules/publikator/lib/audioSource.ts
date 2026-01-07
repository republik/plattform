import Debug from 'debug'
import measureDuration from '@rocka/mp3-duration'

const debug = Debug('publikator:lib:audioSource')

interface CommitMeta {
  audioSourceMp3?: string
  audioSourceDurationMs?: number
}

const resToArrayBuffer = (res: Response) => {
  if (!res.ok) {
    throw Error('unable to fetch audio source')
  }

  return res.arrayBuffer()
}

const checkSeconds = (seconds: number) => {
  debug('audio source duration: %ss (%s)', seconds)

  if (seconds === 0) {
    throw new Error('unable to measure audio source duration')
  }

  return seconds
}

const toMiliseconds = (seconds: number) => Math.round(seconds * 1000)

export const maybeApplyAudioSourceDuration = async (
  currentMeta: CommitMeta,
  previousMeta?: CommitMeta,
): Promise<void> => {
  if (
    !!currentMeta.audioSourceMp3 &&
    (!previousMeta ||
      previousMeta.audioSourceMp3 !== currentMeta.audioSourceMp3)
  ) {
    // Audio URL is new or changed - fetch and calculate duration
    debug(
      'fetching audio source and measure duration: %s',
      currentMeta.audioSourceMp3,
    )

    await fetch(currentMeta.audioSourceMp3)
      .then(resToArrayBuffer)
      .then(Buffer.from)
      .then(measureDuration)
      .then(checkSeconds)
      .then(toMiliseconds)
      .then((miliseconds) => {
        currentMeta.audioSourceDurationMs = miliseconds
      })
      .catch((e) => {
        console.error(e, currentMeta.audioSourceMp3)
        throw e
      })
  } else if (
    !!currentMeta.audioSourceMp3 &&
    previousMeta?.audioSourceMp3 === currentMeta.audioSourceMp3 &&
    previousMeta?.audioSourceDurationMs &&
    !currentMeta.audioSourceDurationMs
  ) {
    // Audio URL unchanged but duration missing from current commit (race condition fix)
    // Preserve duration from previous commit
    debug(
      'preserving audioSourceDurationMs from previous commit: %s',
      previousMeta.audioSourceDurationMs,
    )
    currentMeta.audioSourceDurationMs = previousMeta.audioSourceDurationMs
  }

  if (!currentMeta.audioSourceMp3 && 'audioSourceDurationMs' in currentMeta) {
    delete currentMeta.audioSourceDurationMs
  }
}
