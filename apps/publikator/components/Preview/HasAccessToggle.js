import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import { IconPerson, IconPersonOutline } from '@republik/icons'

function HasAccessToggle({ previewHasAccess, onToggle }) {
  const [colorScheme] = useColorContext()
  return (
    <button {...plainButtonRule} onClick={() => onToggle()}>
      {previewHasAccess ? (
        <IconPerson
          {...colorScheme.set('fill', 'text')}
          width={26}
          height={26}
        />
      ) : (
        <IconPersonOutline
          {...colorScheme.set('fill', 'text')}
          width={26}
          height={26}
        />
      )}
    </button>
  )
}

export default HasAccessToggle
