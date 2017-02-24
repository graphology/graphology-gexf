[![Build Status](https://travis-ci.org/graphology/graphology-gexf.svg)](https://travis-ci.org/graphology/graphology-gexf)

# Graphology GEXF Utilities

GEXF parser & writer for [`graphology`](https://graphology.github.io).

For more information about the GEXF file format, you can head [there](https://gephi.org/gexf/format/).

## Installation

```
npm install graphology-gexf
```

## Usage

* [Browser parser](#browser-parser)
* [Browser writer](#browser-writer)

### Browser parser

The parser must be passed a `graphology` constructor and is able to read either a string, or an `XMLDocument` instance.

```js
var Graph = require('graphology');
var gexf = require('graphology-gexf/browser');

// Reading a string
var graph = gexf.parse(Graph, string);

// Reading a dom document
var graph = gexf.parse(Graph, xmlDocument);
```

*Arguments*

* **constructor** *GraphClass*: graphology constructor to use.
* **source** *string|Document*: source data to parse.

### Browser writer

The writer must be passed a `graphology` instance and will output a GEXF string.

```js
var gexf = require('graphology-gexf/browser');

// Writing the graph
var gexfString = gexf.write(graph);
```

*Arguments*

* **graph** *Graph*: graphology instance to write.
