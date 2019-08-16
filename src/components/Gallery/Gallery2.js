import React from 'react'
import ReactDOM from 'react-dom'
import { css } from 'glamor'
import debounce from 'lodash/debounce'

import { fontFamilies } from '../../theme/fonts'

import PhotoSwipe from 'photoswipe'
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default'

import Spinner from '../Spinner'

import {
  imageSizeInfo,
  imageResizeUrl
} from 'mdast-react-render/lib/utils'

import { FigureImage, FigureCaption, FigureByline } from '../Figure'

import { mUp } from '../../theme/mediaQueries'

const photoswipeCss = `

/*! PhotoSwipe main CSS by Dmitry Semenov | photoswipe.com | MIT license */
/*
	Styles for basic PhotoSwipe functionality (sliding area, open/close transitions)
*/
/* pswp = photoswipe */
.pswp {
  display: none;
  font-family: ${fontFamilies.sansSerifRegular};
  font-size: 12px;
  position: absolute;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  overflow: hidden;
  -ms-touch-action: none;
  touch-action: none;
  z-index: 1500;
  -webkit-text-size-adjust: 100%;
  /* create separate layer, to avoid paint on window.onscroll in webkit/blink */
  -webkit-backface-visibility: hidden;
  outline: none;
}

${mUp} {
  .pswp {
    font-size: 15px;
  }
}


.pswp * {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.pswp img {
  max-width: none;
}

/* style is added when JS option showHideOpacity is set to true */
.pswp--animate_opacity {
  /* 0.001, because opacity:0 doesn't trigger Paint action, which causes lag at start of transition */
  opacity: 0.001;
  will-change: opacity;
  /* for open/close transition */
  -webkit-transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
  transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
}

.pswp--open {
  display: block;
}

.pswp--zoom-allowed .pswp__img {
  /* autoprefixer: off */
  cursor: -webkit-zoom-in;
  cursor: -moz-zoom-in;
  cursor: zoom-in;
}

.pswp--zoomed-in .pswp__img {
  /* autoprefixer: off */
  cursor: -webkit-grab;
  cursor: -moz-grab;
  cursor: grab;
}

.pswp--dragging .pswp__img {
  /* autoprefixer: off */
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
  cursor: grabbing;
}

/*
	Background is added as a separate element.
	As animating opacity is much faster than animating rgba() background-color.
*/
.pswp__bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  will-change: opacity;
}

.pswp__scroll-wrap {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.pswp__container,
.pswp__zoom-wrap {
  -ms-touch-action: none;
  touch-action: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

/* Prevent selection and tap highlights */
.pswp__container,
.pswp__img {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.pswp__zoom-wrap {
  position: absolute;
  width: 100%;
  -webkit-transform-origin: left top;
  -ms-transform-origin: left top;
  transform-origin: left top;
  /* for open/close transition */
  -webkit-transition: -webkit-transform 333ms
    cubic-bezier(0.4, 0, 0.22, 1);
  transition: transform 333ms cubic-bezier(0.4, 0, 0.22, 1);
}

.pswp__bg {
  will-change: opacity;
  /* for open/close transition */
  -webkit-transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
  transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
}

.pswp--animated-in .pswp__bg,
.pswp--animated-in .pswp__zoom-wrap {
  -webkit-transition: none;
  transition: none;
}

.pswp__container,
.pswp__zoom-wrap {
  -webkit-backface-visibility: hidden;
}

.pswp__item {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
}

.pswp__img {
  position: absolute;
  width: auto;
  height: auto;
  top: 0;
  left: 0;
}

/*
	stretched thumbnail or div placeholder element (see below)
	style is added to avoid flickering in webkit/blink when layers overlap
*/
.pswp__img--placeholder {
  -webkit-backface-visibility: hidden;
}

/*
	div element that matches size of large image
	large image loads on top of it
*/
.pswp__img--placeholder--blank {
  background: #222;
}

.pswp--ie .pswp__img {
  width: 100% !important;
  height: auto !important;
  left: 0;
  top: 0;
}

/*
	Error message appears when image is not loaded
	(JS option errorMsg controls markup)
*/
.pswp__error-msg {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  text-align: center;
  font-size: 14px;
  line-height: 16px;
  margin-top: -8px;
  color: #ccc;
}

.pswp__error-msg a {
  color: #ccc;
  text-decoration: underline;
}

/*! PhotoSwipe Default UI CSS by Dmitry Semenov | photoswipe.com | MIT license */
/*

	Contents:

	1. Buttons
	2. Share modal and links
	3. Index indicator ("1 of X" counter)
	4. Caption
	5. Loading indicator
	6. Additional styles (root element, top bar, idle state, hidden state, etc.)

*/
/*
	
	1. Buttons

 */
/* <button> css reset */
.pswp__button {
  width: 50px;
  height: 50px;
  position: relative;
  background: none;
  cursor: pointer;
  overflow: visible;
  -webkit-appearance: none;
  display: block;
  border: 0;
  padding: 0;
  margin: 0;
  float: right;
  opacity: 0.75;
  -webkit-transition: opacity 0.2s;
  transition: opacity 0.2s;
  -webkit-box-shadow: none;
  box-shadow: none;
}
.pswp__button:focus,
.pswp__button:hover {
  opacity: 1;
}
.pswp__button:active {
  outline: none;
  opacity: 0.9;
}
.pswp__button::-moz-focus-inner {
  padding: 0;
  border: 0;
}

/* pswp__ui--over-close class it added when mouse is over element that should close gallery */
.pswp__ui--over-close .pswp__button--close {

  opacity: 1;
}

.pswp__button,
.pswp__button--arrow--left:before,
.pswp__button--arrow--right:before {
  background: url('data:image/png;base64,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')
    0 0 no-repeat;
  background-size: 264px 88px;
  width: 50px;
  height: 50px;
  transform: scale(1.25);
}

@media (-webkit-min-device-pixel-ratio: 1.1),
  (-webkit-min-device-pixel-ratio: 1.09375),
  (min-resolution: 105dpi),
  (min-resolution: 1.1dppx) {
  /* Serve SVG sprite if browser supports SVG and resolution is more than 105dpi */
  .pswp--svg .pswp__button,
  .pswp--svg .pswp__button--arrow--left:before,
  .pswp--svg .pswp__button--arrow--right:before {
    background-image: url('data:image/svg+xml,%3C%3Fxml version="1.0" encoding="UTF-8"%3F%3E%3Csvg width="264px" height="88px" viewBox="0 0 264 88" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"%3E%3C!-- Generator: Sketch 53.2 (72643) - https://sketchapp.com --%3E%3Ctitle%3Edefault-skin 2%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cg id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"%3E%3Cg id="default-skin"%3E%3Cpath d="M67.0018835,59.5 L67.0018835,63.268331 C60.6953142,64.1065038 57.8175182,69.0186795 57,73 C59.2189781,70.171167 62.5639273,67.9024591 67.0018835,67.9024591 L67.0018835,71.5 L73,65.5853951 L67.0018835,59.5 Z" id="Shape" fill="%23FFFFFF"%3E%3C/path%3E%3Cg id="Group" transform="translate(13.000000, 15.000000)" fill="%23FFFFFF"%3E%3Cpolygon id="Shape" points="0 14 0 9 2 9 2 12 5 12 5 14"%3E%3C/polygon%3E%3Cpolygon id="Shape" points="0 0 5 0 5 2 2 2 2 5 0 5"%3E%3C/polygon%3E%3Cpath d="M18,0 L18,5 L16,5 L16,2 L15.2629743,2 L13,2 L13,0 L18,0 Z" id="Shape"%3E%3C/path%3E%3Cpolygon id="Shape" points="18 14 13 14 13 12 16 12 16 9 18 9"%3E%3C/polygon%3E%3C/g%3E%3Cg id="Group-4" transform="translate(57.000000, 15.000000)" fill="%23FFFFFF"%3E%3Cpolygon id="Shape" transform="translate(2.500000, 11.500000) rotate(-180.000000) translate(-2.500000, -11.500000) " points="0 14 0 9 2 9 2 12 5 12 5 14"%3E%3C/polygon%3E%3Cpolygon id="Shape" transform="translate(2.500000, 2.500000) rotate(-180.000000) translate(-2.500000, -2.500000) " points="0 0 5 0 5 2 2 2 2 5 0 5"%3E%3C/polygon%3E%3Cpath d="M18,0 L18,5 L16,5 L16,2 L15.2629743,2 L13,2 L13,0 L18,0 Z" id="Shape" transform="translate(15.500000, 2.500000) rotate(-180.000000) translate(-15.500000, -2.500000) "%3E%3C/path%3E%3Cpolygon id="Shape" transform="translate(15.500000, 11.500000) rotate(-180.000000) translate(-15.500000, -11.500000) " points="18 14 13 14 13 12 16 12 16 9 18 9"%3E%3C/polygon%3E%3C/g%3E%3Cpath d="M23,65 L31,65 L31,67 L23,67 L23,75 L21,75 L21,67 L13,67 L13,65 L21,65 L21,57 L23,57 L23,65 Z" id="Rectangle-13" fill="%23FFFFFF" transform="translate(22.000000, 66.000000) rotate(-45.000000) translate(-22.000000, -66.000000) "%3E%3C/path%3E%3Cg id="Group-2" transform="translate(147.000000, 16.000000)"%3E%3Cpolygon id="Rectangle-11" fill="%23FFFFFF" transform="translate(11.767767, 11.767767) scale(-1, 1) rotate(-45.000000) translate(-11.767767, -11.767767) " points="9.67157286 10.767767 9.67157286 12.767767 14.267767 12.767767 14.267767 10.767767"%3E%3C/polygon%3E%3Cpath d="M5.5,11 C8.53756612,11 11,8.53756612 11,5.5 C11,2.46243388 8.53756612,0 5.5,0 C2.46243388,0 0,2.46243388 0,5.5 C0,8.53756612 2.46243388,11 5.5,11 Z" id="Oval-1" stroke="%23FFFFFF" stroke-width="1.5"%3E%3C/path%3E%3Crect id="Rectangle-12" fill="%23FFFFFF" x="3" y="5" width="5" height="1"%3E%3C/rect%3E%3C/g%3E%3Cg id="Group-3" transform="translate(103.000000, 16.000000)"%3E%3Cpolygon id="Rectangle-11" fill="%23FFFFFF" points="9.32690296 10.625 9.32690296 12.625 13.923097 12.625 13.923097 10.625"%3E%3C/polygon%3E%3Cpath d="M5.5,11 C8.53756612,11 11,8.53756612 11,5.5 C11,2.46243388 8.53756612,0 5.5,0 C2.46243388,0 0,2.46243388 0,5.5 C0,8.53756612 2.46243388,11 5.5,11 Z" id="Oval-1" stroke="%23FFFFFF" stroke-width="1.5"%3E%3C/path%3E%3Crect id="Rectangle-17" fill="%23FFFFFF" x="3" y="5" width="5" height="1"%3E%3C/rect%3E%3Crect id="Rectangle-16" fill="%23FFFFFF" transform="translate(5.500000, 5.500000) rotate(-269.000000) translate(-5.500000, -5.500000) " x="3" y="5" width="5" height="1"%3E%3C/rect%3E%3C/g%3E%3Cpolygon id="Path" fill="%23FFFFFF" fill-rule="nonzero" points="157.41 54.41 156 53 150 59 156 65 157.41 63.59 152.83 59"%3E%3C/polygon%3E%3Cpolygon id="Path" fill="%23FFFFFF" fill-rule="nonzero" transform="translate(110.705000, 59.000000) scale(-1, 1) translate(-110.705000, -59.000000) " points="114.41 54.41 113 53 107 59 113 65 114.41 63.59 109.83 59"%3E%3C/polygon%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
  }
  .pswp--svg .pswp__button--arrow--left,
  .pswp--svg .pswp__button--arrow--right {
    background: none;
  }
}

.pswp__button--close {
  background-position: 0 -40px;
}

/* no arrows on touch screens */
.pswp--touch .pswp__button--arrow--left,
.pswp--touch .pswp__button--arrow--right {
  visibility: hidden;
}

/*
	Arrow buttons hit area
	(icon is added to :before pseudo-element)
*/
.pswp__button--arrow--left,
.pswp__button--arrow--right {
  background: none;
  top: 50%;
  margin-top: -50px;
  width: 70px;
  height: 100px;
  position: absolute;
}

.pswp__button--arrow--left {
  left: 0;
}

.pswp__button--arrow--right {
  right: 0;
}

.pswp__button--arrow--left:before,
.pswp__button--arrow--right:before {
  content: \'\';
  top: 35px;
  height: 30px;
  width: 32px;
  position: absolute;
}

.pswp__button--arrow--left:before {
  left: 6px;
  background-position: -138px -50px;
}

.pswp__button--arrow--right:before {
  right: 6px;
  background-position: -94px -50px;
}

/*

	2. Share modal/popup and links

 */
.pswp__counter,
.pswp__share-modal {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.pswp__share-modal {
  display: block;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  padding: 10px;
  position: absolute;
  z-index: 1600;
  opacity: 0;
  -webkit-transition: opacity 0.25s ease-out;
  transition: opacity 0.25s ease-out;
  -webkit-backface-visibility: hidden;
  will-change: opacity;
}

.pswp__share-modal--hidden {
  display: none;
}

.pswp__share-tooltip {
  z-index: 1620;
  position: absolute;
  background: #fff;
  top: 56px;
  border-radius: 2px;
  display: block;
  width: auto;
  right: 50px;
  -webkit-box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
  -webkit-transform: translateY(6px);
  -ms-transform: translateY(6px);
  transform: translateY(6px);
  -webkit-transition: -webkit-transform 0.25s;
  transition: transform 0.25s;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}
.pswp__share-tooltip a {
  display: block;
  padding: 8px 12px;
  color: #000;
  text-decoration: none;
  font-size: 14px;
  line-height: 18px;
}
.pswp__share-tooltip a:hover {
  text-decoration: none;
  color: #000;
}
.pswp__share-tooltip a:first-child {
  /* round corners on the first/last list item */
  border-radius: 2px 2px 0 0;
}
.pswp__share-tooltip a:last-child {
  border-radius: 0 0 2px 2px;
}

.pswp__share-modal--fade-in {
  opacity: 1;
}
.pswp__share-modal--fade-in .pswp__share-tooltip {
  -webkit-transform: translateY(0);
  -ms-transform: translateY(0);
  transform: translateY(0);
}

/* increase size of share links on touch devices */
.pswp--touch .pswp__share-tooltip a {
  padding: 16px 12px;
}

a.pswp__share--facebook:before {
  content: \'\';
  display: block;
  width: 0;
  height: 0;
  position: absolute;
  top: -12px;
  right: 15px;
  border: 6px solid transparent;
  border-bottom-color: #fff;
  -webkit-pointer-events: none;
  -moz-pointer-events: none;
  pointer-events: none;
}

a.pswp__share--facebook:hover {
  background: #3e5c9a;
  color: #fff;
}
a.pswp__share--facebook:hover:before {
  border-bottom-color: #3e5c9a;
}

a.pswp__share--twitter:hover {
  background: #55acee;
  color: #fff;
}

a.pswp__share--pinterest:hover {
  background: #ccc;
  color: #ce272d;
}

a.pswp__share--download:hover {
  background: #ddd;
}

/*

	3. Index indicator ("1 of X" counter)

 */
.pswp__counter {
  position: absolute;
  left: 0;
  top: 0;
  height: 50px;
  font-size: 15px;
  line-height: 50px;
  color: #fff;
  opacity: 0.75;
  padding: 0 10px;
}

${mUp} {
  .pswp__counter {
    top: 5px;
    left: 70px;
  }
}

/*
	
	4. Caption

 */
.pswp__caption {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  min-height: 50px;
}

${mUp} {
  .pswp__caption {
    padding: 15px 70px;
  }
}

.pswp__caption small {
  font-size: 11px;
  color: #bbb;
  line-height: 15px;
}

.pswp__caption__center {
  text-align: left;
  margin: 0 auto;
  font-size: 12px;
  padding: 10px;
  line-height: 15px;
  color: #ccc;
}

${mUp} {
  .pswp__caption__center {
    font-size: 15px;
    padding: 0 70px;
    line-height: 18px;
  }
}

.pswp__caption--empty {
  display: none;
}

/* Fake caption element, used to calculate height of next/prev image */
.pswp__caption--fake {
  visibility: hidden;
}

/*

	5. Loading indicator (preloader)

	You can play with it here - http://codepen.io/dimsemenov/pen/yyBWoR

 */
.pswp__preloader {
  width: 50px;
  height: 50px;
  position: fixed;
  top: 50%;
  left: 50%;
  margin-top: -25px;
  margin-left: -25px;
  z-index: 1400;
  opacity: 0;
  -webkit-transition: opacity 0.25s ease-out;
  transition: opacity 0.25s ease-out;
  will-change: opacity;
  direction: ltr;
}

.pswp__preloader--active {
  opacity: 1;
}
/*
	
	6. Additional styles

 */
/* root element of UI */
.pswp__ui {
  -webkit-font-smoothing: auto;
  visibility: visible;
  opacity: 1;
  z-index: 1550;
}

/* top black bar with buttons and "1 of X" indicator */
.pswp__top-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 65px;
  width: 100%;
}

${mUp} {
  .pswp__top-bar {
    padding: 5px 70px;
  }
}

.pswp__caption,
.pswp__top-bar,
.pswp--has_mouse .pswp__button--arrow--left,
.pswp--has_mouse .pswp__button--arrow--right {
  -webkit-backface-visibility: hidden;
  will-change: opacity;
  -webkit-transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
  transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
}

/* pswp--has_mouse class is added only when two subsequent mousemove events occur */
.pswp--has_mouse .pswp__button--arrow--left,
.pswp--has_mouse .pswp__button--arrow--right {
  visibility: visible;
}

.pswp__top-bar,
.pswp__caption {
  background-color: rgba(0, 0, 0, 0.5);
}

/* pswp__ui--fit class is added when main image "fits" between top bar and bottom bar (caption) */
.pswp__ui--fit .pswp__top-bar,
.pswp__ui--fit .pswp__caption {
  background-color: rgba(0, 0, 0, 0.3);
}

/* pswp__ui--idle class is added when mouse isn\'t moving for several seconds (JS option timeToIdle) */
.pswp__ui--idle .pswp__top-bar {
  opacity: 0;
}

.pswp__ui--idle .pswp__button--arrow--left,
.pswp__ui--idle .pswp__button--arrow--right {
  opacity: 0;
}

/*
	pswp__ui--hidden class is added when controls are hidden
	e.g. when user taps to toggle visibility of controls
*/
.pswp__ui--hidden .pswp__top-bar,
.pswp__ui--hidden .pswp__caption,
.pswp__ui--hidden .pswp__button--arrow--left,
.pswp__ui--hidden .pswp__button--arrow--right {
  /* Force paint & create composition layer for controls. */
  opacity: 0.001;
}

/* pswp__ui--one-slide class is added when there is just one item in gallery */
.pswp__ui--one-slide .pswp__button--arrow--left,
.pswp__ui--one-slide .pswp__button--arrow--right,
.pswp__ui--one-slide .pswp__counter {
  display: none;
}

.pswp__element--disabled {
  display: none !important;
}

.pswp--minimal--dark .pswp__top-bar {
  background: none;
}

`

const removeQuery = (url = '') => url.split('?')[0]

const MAX_SPREAD_ZOOM = 2

const Gallery = ({items, onClose, startItemSrc, children}) => {

  const galleryRef = React.useRef(null)

  React.useEffect(() => {

    if (galleryRef) {

      const startIndex = items.findIndex(
        i => removeQuery(i.src) === removeQuery(startItemSrc)
      )

      const options = {
        index: startIndex,
        closeOnScroll: false,
        maxSpreadZoom: MAX_SPREAD_ZOOM,
        indexIndicatorSep: '/',
        barsSize: {top: 65, bottom:'auto'}, 
        addCaptionHTMLFn: (item, captionEl) => {

          if(!item.title) {
                captionEl.children[0].innerHTML = '';
                return false;
            }
            captionEl.children[0].innerHTML = `${item.title} <small>${item.author}</small>`
            return true;
        },
      }

      const gallery = new PhotoSwipe(
        galleryRef.current,
        PhotoSwipeUI_Default,
        items,
        options,
      )

      gallery.listen('gettingData', function(index, item) {
        const sizeInfo = imageSizeInfo(item.src)
        const maxWidth = Math.min(sizeInfo.width, Math.ceil((window.innerWidth * MAX_SPREAD_ZOOM)/500)*500)
        const resizeUrl = imageResizeUrl(item.src, maxWidth)
        const aspectRatio = sizeInfo.height / sizeInfo.width


        item.src = resizeUrl
        item.w = maxWidth
        item.h = aspectRatio * maxWidth
      });
      gallery.listen('close', onClose);
      gallery.init()

    }
  }, [items])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: photoswipeCss }} />
      <div
        ref={galleryRef}
        className="pswp"
        tabIndex="-1"
        role="dialog"
        style={{background: '#000'}}
      >
        <div className="pswp__bg" />
        <div className="pswp__scroll-wrap">
          <div className="pswp__container">
            <div className="pswp__item" />
            <div className="pswp__item" />
            <div className="pswp__item" />
          </div>
          <div className="pswp__ui pswp__ui--hidden">
            <div className="pswp__top-bar">
              <div className="pswp__counter" />
              <button
                className="pswp__button pswp__button--close"
                title="Close (Esc)"
              />
              <div className="pswp__preloader">
                <Spinner />
              </div>
            </div>

            <button
              className="pswp__button pswp__button--arrow--left"
              title="Zurück"
            />
            <button
              className="pswp__button pswp__button--arrow--right"
              title="Vorwärts"
            />
            <div className="pswp__caption">
              <div className="pswp__caption__center" />
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  )
}

export default Gallery
