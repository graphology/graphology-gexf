/**
 * Graphology Browser GEXF Parser Unit Tests
 * ==========================================
 */
var assert = require('assert'),
    parser = require('../../browser/parser.js'),
    Graph = require('graphology');

var resources = require('../resources');

describe('Parser', function() {

  it('should throw if not given a valid constructor.', function() {
    assert.throws(function() {
      parser(function() {});
    }, /constructor/);
  });

  it('should throw if source has invalid type.', function() {
    assert.throws(function() {
      parser(Graph, null);
    }, /source/);
  });

  it('should succeed in parsing a simple file.', function() {
    const graph = parser(Graph, resources.minimal);

    // console.log(graph);
  });
});
