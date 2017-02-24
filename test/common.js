/**
 * Graphology Browser GEXF Unit Tests Common Utilities
 * ====================================================
 *
 * Testing utilities used by both the browser & the node version.
 */
var assert = require('assert'),
    parserDefinitions = require('./definitions/parser.js'),
    writerDefinitions = require('./definitions/writer.js'),
    resources = require('./resources'),
    Graph = require('graphology');

/**
 * Testing the parser on all of our test files.
 */
exports.testAllFiles = function(parser) {

  parserDefinitions.forEach(function(definition) {
    if (definition.skip)
      return;

    var resource = resources[definition.gexf],
        info = definition.basics;

    it('should properly parse the "' + definition.title + '" file.', function() {
      var graph = parser(Graph, resource);

      assert.deepEqual(graph.getAttributes(), info.meta);
      assert.strictEqual(graph.order, info.order);
      assert.strictEqual(graph.size, info.size);
      assert.strictEqual(graph.type, info.type);
      assert.strictEqual(graph.multi, info.multi);
    });
  });
};

/**
 * Testing the writer on all of our test graphs.
 */
exports.testWriter = function(writer) {

  describe('Writer', function() {

    it('should throw when given an invalid graphology instance.', function() {

      assert.throws(function() {
        writer(null);
      }, /graphology/);
    });

    writerDefinitions.forEach(function(definition) {
      if (definition.skip)
        return;

      var resource = resources[definition.gexf],
          graph = definition.graph();

      it('should correctly write the "' + definition.title + '" graph.', function() {
        var string = writer(graph);

        // console.log(string);
        assert.strictEqual(string, resource);
      });
    });
  });
};
