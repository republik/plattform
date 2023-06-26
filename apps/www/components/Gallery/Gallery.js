import { useRef, useEffect, useMemo } from 'react'
import compose from 'lodash/flowRight'
import PhotoSwipe from 'photoswipe'
import PhotoSwipeUIDefault from 'photoswipe/dist/photoswipe-ui-default'
import { imageSizeInfo, imageResizeUrl } from '@republik/mdast-react-render'
import { Spinner } from '@project-r/styleguide'

import withT from '../../lib/withT'
import photoswipeStyle from './photoswipeStyle'
import { ZINDEX_GALLERY } from '../constants'
import { removeQuery } from '../../lib/utils/link'

const MAX_SPREAD_ZOOM = 2

const Gallery = ({ items, onClose, startItemSrc, children, t }) => {
  const galleryRef = useRef(null)

  // 'items' changes on every rerender of the article-page
  // to prevent a gallery reinit on every rerender, we memoize the items
  // as a string to allow for a correct equality check in the useEffect
  const itemsString = useMemo(() => JSON.stringify(items), [items])

  useEffect(() => {
    if (galleryRef) {
      const startIndex = items.findIndex(
        (i) => removeQuery(i.src) === removeQuery(startItemSrc),
      )

      const options = {
        modal: true,
        index: startIndex,
        closeOnScroll: false,
        maxSpreadZoom: MAX_SPREAD_ZOOM,
        shareEl: false,
        indexIndicatorSep: '/',
        preload: [1, 2],
        barsSize: { top: 65, bottom: 'auto' },
        history: false,
        errorMsg: `<div class="pswp__error-msg"><a href="%url%" target="_blank">${t(
          'article/gallery/error',
        )}</a></div>`,
        addCaptionHTMLFn: (item, captionEl) => {
          const { caption, byLine } = item
          const innerHtml = []

          if (caption) {
            innerHtml.push(caption)
          }

          if (byLine) {
            innerHtml.push(`<small>${byLine}</small>`)
          }

          captionEl.children[0].innerHTML = innerHtml.join(' ')
          return !!innerHtml.length
        },
      }

      const gallery = new PhotoSwipe(
        galleryRef.current,
        PhotoSwipeUIDefault,
        items,
        options,
      )

      gallery.listen('gettingData', function (index, item) {
        const src = item.srcDark || item.src
        const sizeInfo = imageSizeInfo(src)
        const maxWidth = Math.min(
          sizeInfo.width,
          Math.ceil((window.innerWidth * MAX_SPREAD_ZOOM) / 500) * 500,
        )
        const resizeUrl = imageResizeUrl(src, `${maxWidth}x`)
        const aspectRatio = sizeInfo.height / sizeInfo.width
        item.src = resizeUrl
        item.w = maxWidth
        item.h = aspectRatio * maxWidth
      })
      gallery.listen('close', () => {
        // workaround bug opening nav when closing gallery on touch devices
        // - defer onClose one render frame (1000ms/30frames)
        // - othwise the component would already be unmounted when the click reaches the React event system and trigger a event on whatever is underneath
        setTimeout(() => {
          onClose()
        }, 33)
      })
      gallery.init()
    }
  }, [itemsString])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: photoswipeStyle }} />
      <div
        ref={galleryRef}
        className='pswp'
        tabIndex='-1'
        role='dialog'
        style={{
          background: '#000',
          zIndex: ZINDEX_GALLERY,
        }}
        onTouchStart={(e) => {
          // prevent touchstart from bubbling to Pullable
          e.stopPropagation()
        }}
      >
        <div className='pswp__bg' />
        <div className='pswp__scroll-wrap'>
          <div className='pswp__container'>
            <div className='pswp__item' />
            <div className='pswp__item' />
            <div className='pswp__item' />
          </div>
          <div className='pswp__ui pswp__ui--hidden'>
            <div className='pswp__top-bar'>
              <div className='pswp__counter' />
              <button
                className='pswp__button pswp__button--close'
                title={t('article/gallery/close')}
              />
              <div className='pswp__preloader'>
                <Spinner />
              </div>
            </div>

            <button
              className='pswp__button pswp__button--arrow--left'
              title={t('article/gallery/back')}
            />
            <button
              className='pswp__button pswp__button--arrow--right'
              title={t('article/gallery/forward')}
            />
            <div className='pswp__caption'>
              <div className='pswp__caption__center' />
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  )
}

export default compose(withT)(Gallery)
