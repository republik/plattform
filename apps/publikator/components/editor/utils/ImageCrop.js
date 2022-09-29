import { css } from 'glamor'
import { useState, useEffect, useRef } from 'react'
import withT from '../../../lib/withT'
import Cropper from 'react-easy-crop'
import { AudioCoverGenerator, Slider } from '@project-r/styleguide'

const PADDING = 15
const SLIDER_HEIGHT = 52

const ImageCrop = ({ onChange, src, format, t }) => {
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

  const scale = croppedArea?.width ? 100 / croppedArea.width : 1
  const transform = {
    x: `${croppedArea?.x ? -croppedArea.x * scale : 0}%`,
    y: `${croppedArea?.y ? -croppedArea.y * scale : 0}%`,
    scale,
    width: 'calc(100% + 0.5px)',
    height: 'auto',
  }

  const imageStyle = {
    transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale},${transform.scale},1)`,
    width: transform.width,
    height: transform.height,
    transformOrigin: 'top left',
  }
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {!src ? (
        <AudioCoverGenerator format={format} previewSize={previewSize} />
      ) : (
        <>
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
                const croppedAreaInt = Object.fromEntries(
                  Object.entries(croppedArea).map(([k, v], i) => [
                    k,
                    Math.floor(v),
                  ]),
                )
                setCroppedArea(croppedAreaInt)
                onChange(croppedAreaInt)
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
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                marginBottom: -previewSize,
                paddingBottom: '100%',
              }}
            >
              <img src={src} alt='Preview Crop' style={imageStyle} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default withT(ImageCrop)
