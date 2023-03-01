import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import { PersonIcon, PersonOutlineIcon } from '@republik/icons'

function HasAccessToggle({ previewHasAccess, onToggle }) {
  const [colorScheme] = useColorContext()
  return (
    <button {...plainButtonRule} onClick={() => onToggle()}>
      {previewHasAccess ? (
        <PersonIcon
          {...colorScheme.set('fill', 'text')}
          width={26}
          height={26}
        />
      ) : (
        <PersonOutlineIcon
          {...colorScheme.set('fill', 'text')}
          width={26}
          height={26}
        />
      )}
    </button>
  )
}

export default HasAccessToggle
