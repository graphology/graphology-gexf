/**
 * Graphology Browser GEXF Unit Tests Writer Definitions
 * ======================================================
 *
 * Definitions of the GEXF files stored in `./resources` so we can test
 * that the writer works as expected.
 */
var Graph = require('graphology');

module.exports = [
  {
    title: 'Basic',
    gexf: 'basic',
    graph: function() {
      var graph = new Graph();

      graph.setAttribute('lastModifiedDate', '2105-12-23');
      graph.setAttribute('author', 'Yomguithereal');
      graph.setAttribute('title', 'Basic Graph');

      return graph;
    }
  }
];
