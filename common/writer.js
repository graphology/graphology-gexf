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

var VALID_GEXF_TYPES = new Set([
  'integer',
  'long',
  'double',
  'float',
  'boolean',
  'liststring',
  'string',
  'anyURI'
]);

var VIZ_RESERVED_NAMES = new Set([
  'color',
  'size',
  'position',
  'shape',
  'thickness'
]);

/**
 * Function used to check whether the given integer is 32 bits or not.
 *
 * @param  {number} number - Target number.
 * @return {boolean}
 */
function is32BitInteger(number) {
  return !(number > 0x7FFFFFFF || number < -0x7FFFFFFF);
}

/**
 * Function used to detect a JavaScript's value type in the GEXF model.
 *
 * @param  {any}    value - Target value.
 * @return {string}
 */
function detectValueType(value) {
  if (Array.isArray(value))
    return 'liststring';
  if (typeof value === 'boolean')
    return 'boolean';
  if (typeof value === 'object')
    return 'string';

  // Numbers
  if (typeof value === 'number') {

    // Integer
    if (value === (value | 0)) {

      // Long (JavaScript integer can go up to 53 bit)?
      return is32BitInteger(value) ? 'integer' : 'long';
    }

    // JavaScript numbers are 64 bit float, hence the double
    return 'double';
  }

  return 'string';
}

/**
 * Function used to infer the model of the graph's nodes or edges.
 *
 * @param  {array} elements - The graph's relevant elements.
 * @return {array}
 */
function inferModel(elements) {
  var model = {},
      attributes,
      type,
      k;

  // Testing every attributes
  for (var i = 0, l = elements.length; i < l; i++) {
    attributes = elements[i].attributes;

    for (k in attributes) {
      if (k === 'label' || VIZ_RESERVED_NAMES.has(k))
        continue;

      type = detectValueType(attributes[k]);

      if (!model[k])
        model[k] = type;
      else {
        if (model[k] === 'integer' && type === 'long')
          model[k] = type;
        else if (model[k] !== type)
          model[k] = 'string';
      }
    }
  }

  // TODO: check default values
  return model;
}

/**
 * Function used to write a model.
 *
 * @param {XMLWriter} writer     - The writer to use.
 * @param {object}    model      - Model to write.
 * @param {string}    modelClass - Class of the model.
 */
function writeModel(writer, model, modelClass) {
  var name;

  if (!Object.keys(model).length)
    return;

  writer.startElement('attributes');
  writer.writeAttribute('class', modelClass);

  for (name in model) {
    writer.startElement('attribute');
    writer.writeAttribute('id', name);
    writer.writeAttribute('title', name);
    writer.writeAttribute('type', model[name]);
    writer.endElement();
  }

  writer.endElement();
}

function writeElements(writer, type, model, elements) {
  var emptyModel = !Object.keys(model).length,
      element,
      name,
      edgeType,
      attributes,
      i,
      l;

  writer.startElement(type + 's');

  for (i = 0, l = elements.length; i < l; i++) {
    element = elements[i];
    attributes = element.attributes || {};

    writer.startElement(type);
    writer.writeAttribute('id', element.key);

    if (type === 'edge') {
      edgeType = element.undirected ? 'undirected' : 'directed';

      if (edgeType !== writer.defaultEdgeType)
        writer.writeAttribute('type', edgeType);

      writer.writeAttribute('source', element.source);
      writer.writeAttribute('target', element.target);
    }

    if ('label' in attributes)
      writer.writeAttribute('label', attributes.label);

    if (!emptyModel) {
      writer.startElement('attvalues');

      for (name in model) {
        if (name === 'label')
          continue;

        if (name in attributes) {
          writer.startElement('attvalue');
          writer.writeAttribute('for', name);
          writer.writeAttribute('value', cast(model[name], attributes[name]));
          writer.endElement();
        }
      }

      writer.endElement();
    }

    writer.endElement();
  }

  writer.endElement();
}

/**
 * Function used to cast the given value into the given type.
 *
 * @param  {string} type  - Target type.
 * @param  {any}    value - Value to cast.
 * @return {string}
 */
function cast(type, value) {
  if (type === 'liststring' && Array.isArray(value))
    return value.join('|');
  return '' + value;
}

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

  writer.endElement();
  writer.startElement('graph');
  writer.defaultEdgeType = graph.type === 'undirected' ? 'undirected' : 'directed';
  writer.writeAttribute(
    'defaultedgetype',
    writer.defaultedgetype
  );

  // Processing model
  var nodes = graph.exportNodes(),
      edges = graph.exportEdges();

  var nodeModel = inferModel(nodes);

  writeModel(writer, nodeModel, 'node');

  var edgeModel = inferModel(edges);

  writeModel(writer, edgeModel, 'edge');

  // Processing nodes
  writeElements(writer, 'node', nodeModel, nodes);

  // Processing edges
  writeElements(writer, 'edge', edgeModel, edges);

  return writer.toString();
};
