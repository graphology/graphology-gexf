/**
 * Graphology Browser GEXF SAX Parser Unit Tests
 * ==============================================
 */
var assert = require('assert'),
    Graph = require('graphology'),
    saxParser = require('../../common/sax-parser.js'),
    fs = require('fs'),
    path = require('path');

describe('SAX Parser', function() {
  this.timeout(5 * 1000);

  var parser = saxParser(Graph, Function.prototype);

  var stream = fs.createReadStream(path.join(__dirname, '..', 'resources', 'arctic.gexf'), 'utf-8');

  stream.on('data', function(data) {
    parser.write(data);
  });

  stream.on('end', function() {
    parser.close();
  });

  // it('should throw if not given a valid constructor.', function() {
  //   assert.throws(function() {
  //     parser(function() {});
  //   }, /constructor/);
  // });

  // it('should throw if source has invalid type.', function() {
  //   assert.throws(function() {
  //     parser(Graph, null);
  //   }, /source/);
  // });

  // common.testAllFiles(parser);
});
