import { BanksGraphic } from './BanksGraphics'
import { ScrollyFrame } from './toolbox/ScrollyFrame'

export const BanksScrolly = ({ stepIds }: { stepIds: string[] }) => (
  <ScrollyFrame stepIds={stepIds} Graphic={BanksGraphic} />
)
