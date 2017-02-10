/**
 * Graphology Common GEXF Writer
 * ==============================
 *
 * GEXF writer working for both node.js & the browser.
 */
var isGraph = require('graphology-utils/is-graph'),
    XMLWriter = require('xml-writer');

// TODO: options => prettyPrint, nodeModel, edgeModel

/**
 * Constants.
 */
var DEFAULT_ENCODING = 'UTF-8',
    GEXF_NAMESPACE = 'http://www.gexf.net/1.2draft',
    GEXF_VIZ_NAMESPACE = 'http:///www.gexf.net/1.1draft/viz',
    XSI_URL = 'http://www.w3.org/2001/XMLSchema-instance',
    XSI_SCHEMA_LOCATION = 'http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd';

/**
 * Function taking a graphology instance & outputting a gexf string.
 *
 * @param  {Graph}  graph        - Target graphology instance.
 * @param  {object} options      - Options:
 * @param  {string}   [encoding]   - Character encoding.
 * @return {string}              - GEXF string.
 */
module.exports = function writer(graph, options) {
  if (!isGraph(graph))
    throw new Error('graphology-gexf/writer: invalid graphology instance.');

  options = options || {};

  var writer = new XMLWriter(true);

  var ENCODING = options.encoding || DEFAULT_ENCODING;

  writer.startDocument('1.0', ENCODING);

  // Starting gexf
  writer.startElement('gexf');
  writer.writeAttribute('version', '1.2');
  writer.writeAttribute('xmlns', GEXF_NAMESPACE);
  writer.writeAttribute('xmlns:viz', GEXF_VIZ_NAMESPACE);
  writer.writeAttribute('xsi', XSI_URL);
  writer.writeAttribute('xsi:schemaLocation', XSI_SCHEMA_LOCATION);

  // Processing meta
  writer.startElement('meta');
  var graphAttributes = graph.getAttributes();

  if (graphAttributes.lastModifiedDate)
    writer.writeAttribute('lastmodifieddate', graphAttributes.lastModifiedDate);

  for (k in graphAttributes) {
    if (k !== 'lastModifiedDate')
      writer.writeElement(k, graphAttributes[k]);
  }

  return writer.toString();
};
