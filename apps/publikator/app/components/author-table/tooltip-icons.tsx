import { Box, Flex, Tooltip } from '@radix-ui/themes'
import { IdCardLanyard, PhilippinePeso } from 'lucide-react'
import { Contributor } from '../../authors/page'

// Republik SVG Icon Component that works like lucide-react icons
const RepublikIcon = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 16 16'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    style={{ color }}
    {...props}
  >
    <path
      d='M14 13.5437V14H9.97802L7.53846 8.55775L6.48352 9.48732V12.5465L6.68132 12.9859L7.96703 13.5606V14H2V13.5606L3.12088 12.9859L3.31868 12.5465V3.45352L3.12088 3.01408L2 2.43944V2H8.62637C9.83516 2 10.7692 2.25915 11.4286 2.77746C12.0989 3.28451 12.4341 3.97747 12.4341 4.85634C12.4341 5.78028 12.1044 6.51268 11.4451 7.05352C10.7857 7.59437 9.85714 7.93239 8.65934 8.06761V8.28732L10.967 8.67606L13.1264 12.9521L14 13.5437ZM6.48352 7.66197H7.15934C7.73077 7.66197 8.21429 7.45352 8.60989 7.03662C9.01648 6.61972 9.21978 6.01127 9.21978 5.21127C9.21978 4.46761 9.04945 3.89859 8.70879 3.50423C8.37912 3.09859 7.96703 2.86197 7.47253 2.79437L6.48352 3.80845V7.66197Z'
      fill='currentColor'
    />
  </svg>
)

interface TooltipIconProps {
  condition: boolean
  tooltip: string
  icon: React.ElementType
}

const TooltipIcon: React.FC<TooltipIconProps> = ({
  condition,
  tooltip,
  icon: Icon,
}) => (
  <Tooltip content={tooltip}>
    <Box>
      <Icon
        size={16}
        style={{
          color: condition ? '#000' : '#DDD',
          cursor: 'help',
        }}
      />
    </Box>
  </Tooltip>
)

const TooltipIcons = ({contributor}: {
  contributor: Contributor
}) => {
  return (
    <Flex gap='4'>
      <TooltipIcon
        condition={contributor.employee !== null}
        tooltip={
          contributor.employee !== null
            ? 'Ist oder war Mitglied der Republik Redaktion'
            : 'Externe*r Autor*in'
        }
        icon={RepublikIcon}
      />
      <TooltipIcon
        condition={contributor.userId !== null}
        tooltip={
          contributor.userId !== null
            ? 'Verknüpftes Verlegerprofil'
            : 'Kein verknüpftes Verlegerprofil'
        }
        icon={IdCardLanyard}
      />
      <TooltipIcon
        condition={contributor.prolitterisId !== null}
        tooltip={
          contributor.prolitterisId !== null
            ? 'ProlitterisID hinterlegt'
            : 'Keine ProlitterisID hinterlegt'
        }
        icon={PhilippinePeso}
      />
    </Flex>
  )
}

export default TooltipIcons
