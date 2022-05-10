const SvgZug = (props) => (
  <svg width={props.size} height={props.size} viewBox='0 0 600 600' {...props}>
    <path fill='#fff' d='M0 0h600v600H0z' />
    <path fill='#0073e5' d='M0 200h600v200H0z' />
  </svg>
)

export default SvgZug
