/**
 * Graphology Browser GEXF Parser
 * ===============================
 *
 * Browser version of the graphology GEXF parser.
 */
var isGraphConstructor = require('graphology-utils/is-graph-constructor');

/**
 * Function taking either a string or a document and returning a
 * graphology instance.
 *
 * @param  {function}        Graph  - A graphology constructor.
 * @param  {string|Document} source - The source to parse.
 */
module.exports = function parse(Graph, source) {
  var xmlDoc = source;

  if (!isGraphConstructor(Graph))
    throw new Error('graphology-gexf/browser/parser: invalid Graph constructor.');

  // If source is a string, we are going to parse it
  if (typeof source === 'string')
    xmlDoc = (new DOMParser()).parseFromString(source, 'application/xml');

  if (!(xmlDoc instanceof Document))
    throw new Error('graphology-gexf/browser/parser: source should either be a XML document or a string.');
};
