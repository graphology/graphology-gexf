/**
 * Graphology Browser GEXF Parser
 * ===============================
 *
 * Browser version of the graphology GEXF parser.
 */
var isGraphConstructor = require('graphology-utils/is-graph-constructor');

/**
 * Function checking whether the given value is a NaN.
 *
 * @param  {any} value - Value to test.
 * @return {boolean}
 */
function isReallyNaN(value) {
  return value !== value;
}

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
 * Function used to extract the model from the right elements.
 *
 * @param  {Array<Node>} elements - Target DOM nodes.
 * @return {array}                - The model & default attributes.
 */
function extractModel(elements) {
  var model = {},
      defaults = {},
      element;

  for (var i = 0, l = elements.length; i < l; i++) {
    element = elements[i];
    id = element.getAttribute('id') || element.getAttribute('for');

    model[id] = {
      id: id,
      type: element.getAttribute('type') || 'string',
      title: !isReallyNaN(+id) ?
        (element.getAttribute('title') || id) :
        id
    };

    // Default?
    defaultElement = element.getElementsByTagName('default')[0];

    if (defaultElement)
      defaults[model[id].title] = cast(
        model[id].type,
        defaultElement.textContent
      );
  }

  return [model, defaults];
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
      id;

  for (var i = 0, l = valueElements.length; i < l; i++) {
    valueElement = valueElements[i];
    id = (
      valueElement.getAttribute('id') ||
      valueElement.getAttribute('for')
    );

    data[model[id].title] = cast(
      model[id].type,
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
      result,
      type,
      source,
      target,
      attributes,
      id,
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
  result = extractModel(NODE_MODEL_ELEMENTS);
  NODE_MODEL = result[0];
  NODE_DEFAULT_ATTRIBUTES = result[1];

  result = extractModel(EDGE_MODEL_ELEMENTS);
  EDGE_MODEL = result[0];
  EDGE_DEFAULT_ATTRIBUTES = result[1];

  // Instantiating our graph
  var graph = new Graph({
    defaultNodeAttributes: NODE_DEFAULT_ATTRIBUTES,
    defaultEdgeAttributes: EDGE_DEFAULT_ATTRIBUTES
  });

  // Adding nodes
  for (i = 0, l = NODE_ELEMENTS.length; i < l; i++) {
    element = NODE_ELEMENTS[i];

    graph.addNode(
      element.getAttribute('id'),
      collectAttributes(NODE_MODEL, element)
    );
  }

  // Adding edges
  for (i = 0, l = EDGE_ELEMENTS.length; i < l; i++) {
    element = EDGE_ELEMENTS[i];

    id = element.getAttribute('id');
    type = element.getAttribute('type') || DEFAULT_EDGE_TYPE;
    source = element.getAttribute('source');
    target = element.getAttribute('target');
    attributes = collectAttributes(EDGE_MODEL, element);

    if (id) {
      if (type === 'directed')
        graph.addDirectedEdgeWithKey(id, source, target, attributes);
      else
        graph.addUndirectedEdgeWithKey(id, source, target, attributes);
    }
    else {
      if (type === 'directed')
        graph.addDirectedEdge(source, target, attributes);
      else
        graph.addUndirectedEdge(source, target, attributes);
    }
  }

  return graph;
};
