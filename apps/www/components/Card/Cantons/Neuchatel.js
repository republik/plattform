const SvgNeuchatel = (props) => (
  <svg width={props.size} height={props.size} viewBox='0 0 540 540' {...props}>
    <path fill='#e8423f' d='M0 0h540v540H0z' />
    <path fill='#fff' d='M0 0h360v540H0z' />
    <path fill='#16a74e' d='M0 0h180v540H0z' />
    <path d='M450 20v140m-70-70h140' stroke='#fff' strokeWidth={20} />
  </svg>
)

export default SvgNeuchatel
