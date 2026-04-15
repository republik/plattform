import { atom, useAtom } from 'jotai'

const currentTimeAtom = atom(0)
const durationAtom = atom(0)

export const useGlobalAudioState = () => {
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom)
  const [duration, setDuration] = useAtom(durationAtom)

  return {
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
  }
}
