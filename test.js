/**
 * Graphology Utils Unit Tests
 * ============================
 */
var assert = require('assert'),
    Graph = require('graphology'),
    isGraph = require('./is-graph.js'),
    isGraphConstructor = require('./is-graph-constructor.js');

var UndirectedGraph = Graph.UndirectedGraph;

describe('graphology-utils', function() {

  describe('isGraph', function() {

    it('should correctly return whether the given value is a graphology instance.', function() {
      var graph = new Graph(),
          multiDirectedGraph = new Graph(null, {multi: true, type: 'directed'});

      assert.strictEqual(isGraph(graph), true);
      assert.strictEqual(isGraph(multiDirectedGraph), true);

      var nonGraphs = [
        null,
        false,
        '',
        'test',
        0,
        -45,
        5380,
        6.4,
        {},
        [],
        {hello: 'world'},
        [1, 2, 3],
        new RegExp(),
        new Date()
      ];

      nonGraphs.forEach(function(value) {
        assert.strictEqual(isGraph(value), false);
      });
    });

  });

  describe('isGraphConstructor', function() {

    it('should correctly return whether the given value is a graphology constructor.', function() {
      assert.strictEqual(isGraphConstructor(Graph), true);
      assert.strictEqual(isGraphConstructor(UndirectedGraph), true);

      var nonGraphsConstructors = [
        null,
        false,
        '',
        'test',
        0,
        -45,
        5380,
        6.4,
        {},
        [],
        {hello: 'world'},
        [1, 2, 3],
        new RegExp(),
        new Date(),
        new Graph(),
        new UndirectedGraph()
      ];

      nonGraphsConstructors.forEach(function(value) {
        assert.strictEqual(isGraphConstructor(value), false);
      });
    });
  });
});
