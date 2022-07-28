import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import {
  IoPerson as Person,
  IoPersonOutline as PersonOutline,
} from 'react-icons/io5'

function HasAccessToggle({ previewHasAccess, onToggle }) {
  const [colorScheme] = useColorContext()
  return (
    <button {...plainButtonRule} onClick={() => onToggle()}>
      {previewHasAccess ? (
        <Person {...colorScheme.set('fill', 'text')} size={26} />
      ) : (
        <PersonOutline {...colorScheme.set('fill', 'text')} size={26} />
      )}
    </button>
  )
}

export default HasAccessToggle
