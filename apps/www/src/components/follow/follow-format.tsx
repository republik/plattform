import { ArticleSection } from '@app/components/ui/section'
import { css } from '@republik/theme/css'

function FollowFormat({ format }: { format: Document }) {
  return (
    <div className={css({ marginTop: 8 })}>
      <ArticleSection>Follow FORMAT</ArticleSection>
    </div>
  )
}

export default FollowFormat
