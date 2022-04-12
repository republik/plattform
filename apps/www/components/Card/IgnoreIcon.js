const Icon = ({ size, fill = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    style={{ verticalAlign: 'middle' }}
    viewBox='0 0 24 24'
  >
    <g fill='none' fillRule='evenodd' transform='translate(1 0)'>
      <path
        stroke={fill}
        fill={fill}
        fillRule='nonzero'
        d='M18 6.41L16.59 5 11 10.59 5.41 5 4 6.41 9.59 12 4 17.59 5.41 19 11 13.41 16.59 19 18 17.59 12.41 12z'
      />
    </g>
  </svg>
)

export default Icon
