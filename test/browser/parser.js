/**
 * Graphology Browser GEXF Parser Unit Tests
 * ==========================================
 */
var assert = require('assert'),
    parser = require('../../browser/parser.js'),
    Graph = require('graphology');

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
});
