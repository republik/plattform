'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.imageResizeUrl = exports.imageSizeInfo = exports.matchImageParagraph = exports.matchImage = exports.matchParagraph = exports.matchZone = exports.matchHeading = exports.matchType = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _url = require('url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matchType = exports.matchType = function matchType(type) {
  return function (node) {
    return node.type === type;
  };
};
var matchHeading = exports.matchHeading = function matchHeading(depth) {
  return function (node) {
    return node.type === 'heading' && node.depth === depth;
  };
};
var matchZone = exports.matchZone = function matchZone(identifier) {
  return function (node) {
    return node.type === 'zone' && node.identifier === identifier;
  };
};
var matchParagraph = exports.matchParagraph = matchType('paragraph');
var matchImage = exports.matchImage = matchType('image');
var matchImageParagraph = exports.matchImageParagraph = function matchImageParagraph(node) {
  return matchParagraph(node) && node.children.length === 1 && matchImage(node.children[0]);
};

var imageSizeInfo = exports.imageSizeInfo = function imageSizeInfo(url) {
  var urlObject = (0, _url.parse)(url, true);
  var size = urlObject.query.size;

  if (!size) {
    return null;
  }

  var _size$split = size.split('x'),
      _size$split2 = (0, _slicedToArray3.default)(_size$split, 2),
      width = _size$split2[0],
      height = _size$split2[1];

  return {
    width: width,
    height: height
  };
};

var imageResizeUrl = exports.imageResizeUrl = function imageResizeUrl(url, size) {
  var urlObject = (0, _url.parse)(url, true);
  urlObject.query.resize = size;
  // ensure format calculates from query object
  urlObject.search = undefined;
  return (0, _url.format)(urlObject);
};