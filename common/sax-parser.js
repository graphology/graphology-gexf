/**
 * Graphology GEXF SAX Parser
 * ===========================
 *
 * Version of the graphology GEXF parser that is able to stream thanks to a
 * SAX parser.
 */
var isGraphConstructor = require('graphology-utils/is-graph-constructor'),
    // helpers = require('../common/helpers.js'),
    sax = require('sax');

// var cast = helpers.cast;

module.exports = function saxParser(Graph, callback) {
  if (!isGraphConstructor(Graph))
    throw new Error('graphology-gexf/sax-parser: invalid Graph constructor.');

  if (typeof callback !== 'function')
    throw new Error('graphology-gexf/sax-parser: expecting a callback function.');

  var parser = sax.parser(true);

  // Error handling
  parser.onerror = function(e) {
    return callback(e);
  };

  // State
  var state = {
    inGraph: false
  };

  /* eslint no-unused-vars: 0 */
  var graph = null;

  // Defaults
  var DEFAULT_EDGE_TYPE = 'undirected';

  // Parser declaration
  parser.onopentag = function(tag) {
    if (tag.name === 'graph') {
      state.inGraph = true;

      if (tag.attributes.defaultedgetype)
        DEFAULT_EDGE_TYPE = tag.attributes.defaultedgetype;

      if (DEFAULT_EDGE_TYPE === 'mutual')
        DEFAULT_EDGE_TYPE = 'undirected';

      graph = new Graph({type: DEFAULT_EDGE_TYPE});

      return;
    }
  };

  // Returning a protected write interface
  return {
    write: parser.write.bind(parser),
    close: parser.close.bind(parser)
  };
};
