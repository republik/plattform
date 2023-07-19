import { IvfGraphic } from './IvfGraphic'
import { ScrollyFrame } from './toolbox/ScrollyFrame'

export const IvfScrolly = ({ stepIds }: { stepIds: string[] }) => (
  <ScrollyFrame stepIds={stepIds} Graphic={IvfGraphic} />
)
