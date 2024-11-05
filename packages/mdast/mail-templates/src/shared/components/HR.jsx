import colors from '../../styleguide-clone/theme/colors'

const hrStyle = {
  border: 0,
  height: 1,
  color: colors.divider,
  backgroundColor: colors.divider,
  marginTop: 30,
  marginBottom: 30,
}

const HR = () => <hr style={hrStyle} />

export default HR
