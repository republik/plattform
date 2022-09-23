import { css } from 'glamor'
import { useState, useEffect, useRef } from 'react'
import withT from '../../../lib/withT'
import Cropper from 'react-easy-crop'
import { AudioCover, Slider } from '@project-r/styleguide'

const PADDING = 15
const SLIDER_HEIGHT = 52

const ImageCrop = ({
  onChange,
  t,
  src,
  dark,
  label,
  maxHeight,
  imageStyles,
  placeholder,
  maxWidth = 200,
  width,
  height,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef()

  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    const measure = () => {
      setContainerWidth(containerRef.current.clientWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [])
  const previewSize = containerWidth / 2 - PADDING || 0
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div
        style={{
          position: 'absolute',
          height: previewSize,
          width: previewSize,
          marginBottom: SLIDER_HEIGHT,
        }}
      >
        <Cropper
          image={src}
          aspect={1}
          crop={crop}
          zoom={zoom}
          onCropChange={setCrop}
          onCropAreaChange={(croppedArea) => {
            setCroppedArea(croppedArea)
            onChange(croppedArea)
          }}
        />
        <div
          style={{
            position: 'relative',
            top: containerWidth / 2,
            width: previewSize,
          }}
        >
          <Slider
            fullWidth
            label={'Zoom: ' + zoom}
            value={zoom * 10}
            min='10'
            max='20'
            onChange={(_, zoom) => setZoom(zoom / 10)}
          />
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          left: containerWidth / 2 + PADDING,
          width: previewSize,
          height: previewSize,
        }}
      >
        <AudioCover
          image={src}
          croppedArea={croppedArea}
          previewSize={previewSize}
        />
      </div>
    </div>
  )
}

export default withT(ImageCrop)
