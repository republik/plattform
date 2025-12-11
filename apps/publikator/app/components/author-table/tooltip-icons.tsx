import { Box, Flex, Tooltip } from '@radix-ui/themes'
import { IdCardLanyard, ParkingSquare } from 'lucide-react'
import { ArticleContributor } from '../../../graphql/republik-api/__generated__/gql/graphql'

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

const TooltipIcons = ({
  userId,
  prolitterisId,
}: Partial<ArticleContributor>) => {
  return (
    <Flex gap='4'>
      <TooltipIcon
        condition={userId !== null}
        tooltip={
          userId !== null
            ? 'Verknüpftes Verlegerprofil'
            : 'Kein verknüpftes Verlegerprofil'
        }
        icon={IdCardLanyard}
      />
      <TooltipIcon
        condition={prolitterisId !== null}
        tooltip={
          prolitterisId !== null
            ? 'ProlitterisID hinterlegt'
            : 'Keine ProlitterisID hinterlegt'
        }
        icon={ParkingSquare}
      />
    </Flex>
  )
}

export default TooltipIcons
