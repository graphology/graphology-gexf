/**
 * Graphology Browser GEXF Unit Tests Common Utilities
 * ====================================================
 *
 * Testing utilities used by both the browser & the node version.
 */
var assert = require('assert'),
    definitions = require('./definitions.js'),
    resources = require('./resources'),
    Graph = require('graphology');

exports.testAllFiles = function(parser) {

  definitions.forEach(function(definition) {
    if (definition.skip)
      return;

    var resource = resources[definition.gexf],
        info = definition.basics;

    it('should properly parse the "' + definition.title + '" file.', function() {
      var graph = parser(Graph, resource);

      assert.deepEqual(graph.getAttributes(), info.meta);
      assert.strictEqual(graph.order, info.order);
      assert.strictEqual(graph.size, info.size);
    });
  });
};
