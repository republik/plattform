const SvgFribourg = (props) => (
  <svg width={props.size} height={props.size} viewBox='0 0 600 600' {...props}>
    <path fill='#fff' d='M0 0h600v600H0z' />
    <path d='M0 0h600v300H0z' />
  </svg>
)

export default SvgFribourg
