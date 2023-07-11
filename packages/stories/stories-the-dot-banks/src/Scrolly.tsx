import { BanksGraphic } from './BanksGraphics'
import { ScrollyFrame } from './toolbox/ScrollyFrame'

export const Scrolly = ({ stepIds }: { stepIds: string[] }) => {
  console.log({ stepIds })
  return <ScrollyFrame stepIds={stepIds} Graphic={BanksGraphic} />
}
