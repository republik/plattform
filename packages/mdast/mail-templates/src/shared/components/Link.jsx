import colors from '../../styleguide-clone/theme/colors'

export const Link = ({ children, href, title }) => (
  <a
    href={href}
    title={title}
    style={{
      color: colors.text,
      textDecoration: 'underline',
    }}
  >
    {children}
  </a>
)
