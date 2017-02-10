/**
 * Graphology Common GEXF Writer
 * ==============================
 *
 * GEXF writer working for both node.js & the browser.
 */
var isGraph = require('graphology-utils/is-graph');

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
 * Function repeating the given string n times.
 *
 * @param  {string} string - String to repeat.
 * @param  {number} n      - Times to repeat.
 * @return {string}
 */
function repeat(string, n) {

  if (!n)
    return '';

  var repeated = string;

  for (var i = 1; i < n; i++)
    repeated += string;

  return repeated;
}

var indent = repeat.bind(null, ' ');

/**
 * Helper taking a name & a value and returning a XML attribute string.
 *
 * @param  {string} name  - Name of the attribute.
 * @param  {any}    value - Attribute's value.
 * @return {string}
 */
function attr(name, value) {
  return name + '="' + value + '"';
}

/**
 * Helper taking a tag name, attributes & children to return a XML string.
 *
 * @param  {number} level      - Indentation level.
 * @param  {string} tagName    - Tag name.
 * @param  {object} attributes - Attributes.
 * @param  {array}  children   - Child elements.
 * @return {string}
 */
function el(level, tagName, attributes, children) {
  var string = indent(level) + '<' + tagName;

  if (attributes) {
    for (var name in attributes)
      string += ' ' + attr(name, attributes[name]);
  }

  if (!children || !children.length) {
    string += ' />';
  }
  else {
    var lone = children.length === 1 && typeof children[0] !== 'object',
        child,
        i,
        l;

    string += '>';

    for (i = 0, l = children.length; i < l; i++) {
      child = children[i];

      if (typeof child === 'object')
        string += '\n' + el(level + 2, child.tagName, child.attributes, child.children);
      else
        string += (lone  ? '' : ('\n' + indent(level + 2))) + child;
    }

    string += (lone  ? '' : ('\n' + indent(level))) + '</' + tagName + '>';
  }

  return string;
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

  var k;

  var ENCODING = options.encoding || DEFAULT_ENCODING;

  var XML = '<?xml version="1.0" encoding="' + ENCODING +'"?>\n';

  var meta = {
    tagName: 'meta',
    attributes: {},
    children: []
  };

  var graphAttributes = graph.getAttributes();

  if (graphAttributes.lastModifiedDate)
    meta.attributes.lastmodifieddate = graphAttributes.lastModifiedDate;

  for (k in graphAttributes) {
    if (k !== 'lastModifiedDate')
      meta.children.push({tagName: k, children: [graphAttributes[k]]});
  }

  var gexf = el(
    0,
    'gexf',
    {
      'version': '1.2',
      'xmlns': GEXF_NAMESPACE,
      'xmlns:viz': GEXF_VIZ_NAMESPACE,
      'xmlns:xsi': XSI_URL,
      'xsi:schemaLocation': XSI_SCHEMA_LOCATION
    },
    [
      meta
    ]
  );

  XML += gexf + '\n';

  return XML;
};
