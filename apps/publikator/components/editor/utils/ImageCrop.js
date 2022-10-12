import { useState, useEffect, useRef } from 'react'
import { css } from 'glamor'
import withT from '../../../lib/withT'
import Cropper from 'react-easy-crop'
import {
  AudioCoverGenerator,
  Slider,
  fontStyles,
  Button,
  usePrevious,
} from '@project-r/styleguide'

const PADDING = 15
const SLIDER_HEIGHT = 52

const INIT_CROP = { x: 0, y: 0 }
const INIT_ZOOM = 1

const isDifferent = (area1, area2, delta = 0) =>
  area1 &&
  area2 &&
  (Math.abs(area1.x - area2.x) > delta ||
    Math.abs(area1.y - area2.y) > delta ||
    Math.abs(area1.width - area2.width) > delta ||
    Math.abs(area1.height - area2.height) > delta)

const isBase64 = (img) => img.startsWith('data:image/jpeg;base64')

const InnerCropper = ({ onChange, onReset, image, crop: initialCropArea }) => {
  const prevImage = usePrevious(image)

  const [cropperKey, setCropperKey] = useState(1)
  const remountCropper = () => setCropperKey((key) => key + 1)

  const [crop, setCrop] = useState(INIT_CROP)
  const [zoom, setZoom] = useState(INIT_ZOOM)
  const [initCroppedArea, setInitCroppedArea] = useState(initialCropArea)
  const [croppedArea, setCroppedArea] = useState(initialCropArea)

  useEffect(() => {
    // reset state if crop area changes outside of component
    // (for example on "verwerfen")
    if (isDifferent(initialCropArea, croppedArea)) {
      setInitCroppedArea(initialCropArea)
      remountCropper()
    }
  }, [initialCropArea])

  useEffect(() => {
    if (
      prevImage &&
      prevImage !== image &&
      // exclude case where the previous img is base64 and new image is url
      !(isBase64(prevImage) && !isBase64(image))
    ) {
      onReset()
    }
  }, [image, prevImage])

  const onCropComplete = (area) => {
    let croppedAreaInt = Object.fromEntries(
      Object.entries(area).map(([k, v], i) => [k, Math.round(v)]),
    )
    // the cropper tends to drift by 1 pixel
    // this error tolerance prevents phantom changes to appear in Publikator
    if (!croppedArea || isDifferent(croppedAreaInt, croppedArea, 1)) {
      if (initCroppedArea && !isDifferent(croppedAreaInt, initCroppedArea, 1)) {
        croppedAreaInt = initCroppedArea
      }
      setCroppedArea(croppedAreaInt)
      onChange(croppedAreaInt)
    }
  }

  return (
    <>
      <Cropper
        key={cropperKey}
        image={image}
        aspect={1}
        crop={crop}
        zoom={zoom}
        initialCroppedAreaPercentages={initialCropArea}
        onCropChange={setCrop}
        onZoomChange={(value) => setZoom(value.toFixed(1))}
        maxZoom={2}
        minZoom={1}
        zoomWithScroll={false}
        onCropComplete={onCropComplete}
      />
      <div
        style={{
          position: 'relative',
          marginTop: 'calc(100% + 40px)',
        }}
      >
        <Slider
          fullWidth
          label={'Zoom: ' + zoom}
          value={zoom * 10}
          min='10'
          max='20'
          onChange={(_, zoom) => {
            setZoom(zoom / 10)
          }}
        />
        <Button small onClick={onReset} style={{ marginTop: 8 }}>
          Ausschnitt Zurücksetzen
        </Button>
      </div>
    </>
  )
}

const ImageCrop = ({ onChange, image, format, crop }) => {
  const [customCropEnabled, setCustomCropEnabled] = useState(false)

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

  const scale = crop?.width ? 100 / crop.width : 1
  const transform = {
    x: `${crop?.x ? -crop.x * scale : 0}%`,
    y: `${crop?.y ? -crop.y * scale : 0}%`,
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

  const onReset = () => {
    setCustomCropEnabled(false)
    onChange(null)
  }

  const hideCropper = !(customCropEnabled || crop)

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {!image ? (
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
            {hideCropper ? (
              <button
                {...css({
                  position: 'absolute',
                  border: 'none',
                  cursor: 'pointer',
                  height: previewSize,
                  width: previewSize,
                  zIndex: 3,
                })}
                onClick={() => setCustomCropEnabled(true)}
              >
                <span style={{ color: 'white', ...fontStyles.sansSerifMedium }}>
                  Eigenen Ausschnitt Setzen
                </span>
              </button>
            ) : (
              <InnerCropper
                image={image}
                crop={crop}
                onChange={onChange}
                onReset={onReset}
              />
            )}
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
            {hideCropper ? (
              <img
                src={image}
                alt='Preview Crop'
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : (
              <div
                style={{
                  marginBottom: -previewSize,
                  paddingBottom: '100%',
                }}
              >
                <img src={image} alt='Preview Crop' style={imageStyle} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default withT(ImageCrop)
