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

  // var state = null;

  // Returning a protected write interface
  return {
    write: parser.write.bind(parser),
    close: parser.writer.close(parser)
  };
};
