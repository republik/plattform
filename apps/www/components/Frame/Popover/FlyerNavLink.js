import NavLink from './NavLink'
import useFlyerMeta from './useFlyerMeta'

const FlyerNavLink = ({ children, ...props }) => {
  const flyerMeta = useFlyerMeta()
  const href = flyerMeta?.path || '/format/journal'
  return (
    <NavLink {...props} formatColor='accentColorFlyer' href={href}>
      {children}
    </NavLink>
  )
}

export default FlyerNavLink
