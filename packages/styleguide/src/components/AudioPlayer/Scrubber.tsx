type ScrubberProps = {
  /**
   * Returns the current progress as a percentage value
   * of where to seek to.
   */
  onSeek: (progress: number) => void
}

const Scrubber = ({ onSeek }: ScrubberProps) => {
  const handleSeekEnd = () => {
    const progress = 0 // TODO:
    onSeek(progress)
  }

  return null
}

export default Scrubber
