const ratio = 1.385

const Play = ({ width = 26, fill = '#fff' }) => (
  <svg width={width} height={width * ratio} viewBox='0 0 26 36'>
    <path d='M25.956 18.188L.894 35.718V.66' fill={fill} />
  </svg>
)

export default Play
