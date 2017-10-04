'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.imageResizeUrl = exports.imageSizeInfo = exports.matchImageParagraph = exports.matchImage = exports.matchParagraph = exports.matchZone = exports.matchHeading = exports.matchType = undefined;

var _url = require('url');

const matchType = exports.matchType = type => node => node.type === type;
const matchHeading = exports.matchHeading = depth => node => node.type === 'heading' && node.depth === depth;
const matchZone = exports.matchZone = identifier => node => node.type === 'zone' && node.identifier === identifier;
const matchParagraph = exports.matchParagraph = matchType('paragraph');
const matchImage = exports.matchImage = matchType('image');
const matchImageParagraph = exports.matchImageParagraph = node => matchParagraph(node) && node.children.length === 1 && matchImage(node.children[0]);

const imageSizeInfo = exports.imageSizeInfo = url => {
  const urlObject = (0, _url.parse)(url, true);
  const { size } = urlObject.query;
  if (!size) {
    return null;
  }
  const [width, height] = size.split('x');
  return {
    width,
    height
  };
};

const imageResizeUrl = exports.imageResizeUrl = (url, size) => {
  const urlObject = (0, _url.parse)(url, true);
  urlObject.query.resize = size;
  // ensure format calculates from query object
  urlObject.search = undefined;
  return (0, _url.format)(urlObject);
};