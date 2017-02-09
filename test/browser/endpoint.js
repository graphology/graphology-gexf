/**
 * Graphology Browser GEXF Unit Tests Endpoint
 * ============================================
 */
var xmldom = require('xmldom');

global.DOMParser = xmldom.DOMParser;

var doc = (new DOMParser()).parseFromString('<t></t>', 'application/xml');
global.Document = doc.constructor;

describe('Browser', function() {
  require('./parser.js');
});
