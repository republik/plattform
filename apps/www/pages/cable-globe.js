import React from 'react'
import Globe from 'react-globe.gl'

const CustomGlobe = () => {
  const volcanoes = [
    {
      name: 'Abu',
      country: 'Japan',
      type: 'Shield',
      lat: 34.5,
      lon: 131.6,
      elevation: 641,
    },
    {
      name: 'Acamarachi',
      country: 'Chile',
      type: 'Stratovolcano',
      lat: -23.3,
      lon: -67.62,
      elevation: 6046,
    },
  ]

  // console.log(cablePaths)

  return (
    <Globe
      globeImageUrl='//unpkg.com/three-globe/example/img/earth-night.jpg'
      backgroundColor='yellow'
      pointsData={volcanoes}
      pointLat='lat'
      pointLng='lon'
      width={'600px'}
      height={'600px'}
    />
  )
}

export default CustomGlobe
