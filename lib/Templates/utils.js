'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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