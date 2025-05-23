import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Gallery from './Gallery'
import { imageSizeInfo } from '@republik/mdast-react-render'
import { postMessage } from '../../lib/withInNativeApp'
import { removeQuery } from '../../lib/utils/link'
import { mdastToString, MIN_GALLERY_IMG_WIDTH } from '@project-r/styleguide'

const getGroupFigures = (group) => {
  const nodes = group.children
  if (!nodes || nodes.length < 2) return []
  const groupCaptionMdast = nodes.find((n) => n.type === 'paragraph')
  const figures = nodes.slice(0, nodes.length - (groupCaptionMdast ? 1 : 0))
  return figures.map((f) => ({
    ...f,
    children: f.children.concat(groupCaptionMdast),
  }))
}

const findFigures = (node, acc = []) => {
  if (node && node.children && node.children.length > 0) {
    node.children.forEach((c) => {
      if (c.identifier === 'FIGUREGROUP') {
        acc.push(...getGroupFigures(c))
      } else if (c.identifier === 'FIGURE') {
        acc.push(c)
      } else {
        findFigures(c, acc)
      }
    })
  }
  return acc
}

const getImageProps = (node) => {
  const url = node?.children[0]?.children[0]?.url || ''
  const urlDark = node?.children[0]?.children[2]?.url
  const captionMdast = node?.children[1]?.children || []
  const included =
    !node?.data?.excludeFromGallery &&
    imageSizeInfo(url) &&
    imageSizeInfo(url).width > MIN_GALLERY_IMG_WIDTH

  // Children of type "emphasis" ought to be caption byline
  // @see https://github.com/orbiting/styleguide/blob/198f43845d282b498baafbc1e5684b90857bbb4f/src/templates/Article/base.js#L222

  const caption = mdastToString({
    children: captionMdast.filter((n) => n.type !== 'emphasis'),
  })

  const byLine = mdastToString({
    children: captionMdast.filter((n) => n.type === 'emphasis'),
  })

  return {
    src: url,
    srcDark: urlDark,
    title: true, // otherwise PhotoSwipe won't call addCaptionHTMLFn
    caption,
    byLine,
    included,
  }
}

const getGalleryItems = ({ article }) => {
  return findFigures(article.content)
    .map(getImageProps)
    .filter((i) => i.included)
}

class ArticleGallery extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      startItemSrc: null,
    }

    this.toggleGallery = (nextSrc = '') => {
      const nextShow = !this.state.show
      const { galleryItems } = this.state
      if (
        nextShow &&
        galleryItems.some((i) => removeQuery(i.src) === removeQuery(nextSrc))
      ) {
        this.setState(
          {
            show: true,
            startItemSrc: nextSrc,
          },
          () => postMessage({ type: 'fullscreen-enter' }),
        )
      } else {
        this.setState(
          {
            show: false,
            startItemSrc: null,
          },
          () => postMessage({ type: 'fullscreen-exit' }),
        )
      }
    }

    this.show = () => {
      const { galleryItems } = this.state
      if (galleryItems && !!galleryItems.length && !this.state.show) {
        this.toggleGallery(galleryItems[0].src)
      }
    }

    this.getChildContext = () => ({
      toggleGallery: this.toggleGallery,
    })
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      galleryItems: getGalleryItems(nextProps),
    }
  }

  componentDidMount() {
    if (this.props.show) {
      this.show()
    }
  }

  render() {
    const { children } = this.props
    const { article } = this.props
    const { show, startItemSrc, galleryItems } = this.state
    const enabled = article?.content?.meta?.gallery !== false
    return (
      <Fragment>
        {article.content && enabled && show && (
          <Gallery
            onClose={this.toggleGallery}
            items={galleryItems}
            startItemSrc={startItemSrc}
          />
        )}
        {children}
      </Fragment>
    )
  }
}

ArticleGallery.propTypes = {
  article: PropTypes.object.isRequired,
}

ArticleGallery.childContextTypes = {
  toggleGallery: PropTypes.func,
}

export default ArticleGallery
