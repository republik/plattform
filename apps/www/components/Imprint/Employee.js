import { Item } from '../Testimonial/List'
import Link from 'next/link'

const ProfileLink = ({ children, slug }) => {
  return (
    <Link href={`/~${slug}`} passHref legacyBehavior>
      {children}
    </Link>
  );
}

const Employee = ({
  name,
  title,
  user,
  style,
  minColumns,
  maxColumns,
  singleRow,
}) => {
  const displayName = name + (title ? `, ${title}` : '')
  const columnProps = { minColumns, maxColumns, singleRow }
  if (!user) {
    return (
      <Item
        name={displayName}
        style={{ cursor: 'default', ...style }}
        {...columnProps}
      />
    )
  }
  const { portrait, slug } = user
  if (!slug) {
    return (
      <Item
        image={portrait}
        name={displayName}
        style={{ cursor: 'default', ...style }}
        {...columnProps}
      />
    )
  }
  return (
    <ProfileLink slug={slug}>
      <Item
        image={portrait}
        name={displayName}
        style={style}
        {...columnProps}
      />
    </ProfileLink>
  )
}

export default Employee
