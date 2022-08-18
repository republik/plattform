import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import Person from 'react-icons/lib/io/ios-person'
import PersonOutline from 'react-icons/lib/io/ios-person-outline'

function HasAccessToggle({ previewHasAccess, onToggle }) {
  const [colorScheme] = useColorContext()
  return (
    <button {...plainButtonRule} onClick={() => onToggle()}>
      {previewHasAccess ? (
        <Person {...colorScheme.set('fill', 'text')} size={26} />
      ) : (
        <PersonOutline {...colorScheme.set('color', 'text')} size={26} />
      )}
    </button>
  )
}

export default HasAccessToggle
