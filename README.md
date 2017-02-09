[![Build Status](https://travis-ci.org/graphology/graphology-gexf.svg)](https://travis-ci.org/graphology/graphology-gexf)

# Graphology GEXF Utilities

GEXF parser & writer for [`graphology`](https://graphology.github.io).

For more information about the GEXF file format, you can head [there](https://gephi.org/gexf/format/).

## Installation

```
npm install graphology-gexf
```

## Usage

**For the browser**

* [Browser parser](#browser-parser)

### Browser parser

The parser must be passed a `graphology` constructor and is able to read either a string, or an `XMLDocument` instance.

```js
var Graph = require('graphology');
var parser = require('graphology-gexf/browser').parser;

// Reading a string
var graph = parser(Graph, string);

// Reading a dom document
var graph = parser(Graph, xmlDocument);
```

*Arguments*

* **constructor** *GraphClass*: graphology constructor to use.
* **source** *string|Document*: source data to parse.
