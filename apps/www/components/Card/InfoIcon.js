const InfoIcon = (props) => (
  <svg width={props.size} height={props.size} viewBox='0 0 24 24'>
    <g fill='none' fillRule='evenodd'>
      <path
        d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'
        fill='#000'
        fillRule='nonzero'
      />
      <path fill='#FFF' d='M13 17h-2v-6h2zM13 9h-2V7h2z' />
    </g>
  </svg>
)

export default InfoIcon
