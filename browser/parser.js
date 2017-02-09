/**
 * Graphology Browser GEXF Parser
 * ===============================
 *
 * Browser version of the graphology GEXF parser.
 */
var isGraphConstructor = require('graphology-utils/is-graph-constructor');

/**
 * Function used to cast a string value to the desired type.
 *
 * @param  {string} type - Value type.
 * @param  {string} type - String value.
 * @return {any}         - Parsed type.
 */
function cast(type, value) {
  switch (type) {
    case 'boolean':
      value = (value === 'true');
      break;

    case 'integer':
    case 'long':
    case 'float':
    case 'double':
      value = +value;
      break;

    case 'liststring':
      value = value ? value.split('|') : [];
      break;

    default:
  }

  return value;
}

/**
 * Function used to get the desired attribute from a namespaced node.
 *
 * @param  {string} namespace - XML namespace.
 * @param  {Node}   node      - DOM node.
 * @param  {string} name      - Name of the attribute.
 * @return {string}           - String value.
 */
function getAttributeNS(namespace, node, attribute) {
  var value = node.getAttribute(namespace + ':' + attribute);

  if (value === undefined)
    value = node.getAttributeNS(namespace, attribute);

  if (value === undefined)
    value = node.getAttribute(attribute);

  return value;
}

/**
 * Function used to collect an element's attributes.
 *
 * @param  {object} model   - Data model to use.
 * @param  {Node}   element - Target DOM node.
 * @return {object}         - The collected attributes.
 */
function collectAttributes(model, element) {
  var data = {},
      label = element.getAttribute('label');

  if (label)
    data.label = label;

  var valueElements = element.getElementsByTagName('attvalue'),
      valueElement,
      modelId;

  for (var i = 0, l = valueElements.length; i < l; i++) {
    valueElement = valueElements[i];
    modelId = (
      valueElement.getAttribute('id') ||
      valueElement.getAttribute('for')
    );

    data[model[modelId].title] = cast(
      model[modelId].type,
      valueElement.getAttribute('value')
    );
  }

  return data;
}

/**
 * Function taking either a string or a document and returning a
 * graphology instance.
 *
 * @param  {function}        Graph  - A graphology constructor.
 * @param  {string|Document} source - The source to parse.
 */

// TODO: option to map the data to the attributes for customization
module.exports = function parse(Graph, source) {
  var xmlDoc = source;

  var element,
      modelId,
      i,
      l;

  if (!isGraphConstructor(Graph))
    throw new Error('graphology-gexf/browser/parser: invalid Graph constructor.');

  // If source is a string, we are going to parse it
  if (typeof source === 'string')
    xmlDoc = (new DOMParser()).parseFromString(source, 'application/xml');

  if (!(xmlDoc instanceof Document))
    throw new Error('graphology-gexf/browser/parser: source should either be a XML document or a string.');

  // Finding useful elements
  var ROOT_ELEMENT = xmlDoc.getElementsByTagName('gexf')[0],
      GRAPH_ELEMENT = xmlDoc.getElementsByTagName('graph')[0],
      META_ELEMENT = xmlDoc.getElementsByTagName('meta')[0],
      NODE_ELEMENTS = xmlDoc.getElementsByTagName('node'),
      EDGE_ELEMENTS = xmlDoc.getElementsByTagName('edge'),
      MODEL_ELEMENTS = xmlDoc.getElementsByTagName('attributes'),
      NODE_MODEL_ELEMENTS = [],
      EDGE_MODEL_ELEMENTS = [];

  for (i = 0, l = MODEL_ELEMENTS.length; i < l; i++) {
    element = MODEL_ELEMENTS[i];

    if (element.getAttribute('class') === 'node')
      NODE_MODEL_ELEMENTS = element.getElementsByTagName('attribute');
    else if (element.getAttribute('class') === 'edge')
      EDGE_MODEL_ELEMENTS = element.getElementsByTagName('attribute');
  }

  // Information
  var HAS_VIZ = getAttributeNS('xmlns', ROOT_ELEMENT, 'viz'),
      VERSION = ROOT_ELEMENT.getAttribute('version'),
      MODE = GRAPH_ELEMENT.getAttribute('mode') || 'static',
      DEFAULT_EDGE_TYPE = GRAPH_ELEMENT.getAttribute('defaultedgetype') || 'directed';

  if (DEFAULT_EDGE_TYPE === 'mutual')
    DEFAULT_EDGE_TYPE = 'undirected';

  // Computing models
  var NODE_MODEL = {},
      NODE_DEFAULT_ATTRIBUTES = {},
      defaultElement;

  for (i = 0, l = NODE_MODEL_ELEMENTS.length; i < l; i++) {
    element = NODE_MODEL_ELEMENTS[i];
    modelId = element.getAttribute('id') || element.getAttribute('for');

    NODE_MODEL[modelId] = {
      id: modelId,
      type: element.getAttribute('type') || 'string',
      title: element.getAttribute('title') || modelId
    };

    // Default?
    defaultElement = element.getElementsByTagName('default')[0];

    if (defaultElement)
      NODE_DEFAULT_ATTRIBUTES[NODE_MODEL[modelId].title] = cast(NODE_MODEL[modelId].type, defaultElement.textContent);
  }

  // Instantiating our graph
  var graph = new Graph({
    defaultNodeAttributes: NODE_DEFAULT_ATTRIBUTES
  });

  // Adding nodes
  for (i = 0, l = NODE_ELEMENTS.length; i < l; i++) {
    element = NODE_ELEMENTS[i];

    graph.addNode(
      element.getAttribute('id'),
      collectAttributes(NODE_MODEL, element)
    );
  }

  return graph;
};
