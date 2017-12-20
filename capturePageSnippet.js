console.clear();
console.log("Capturing a graph of all custom elements.");

// We add `document.body` as the starting node.
var nodes = [{
  name: 'body',
  id: 'n' + 0,
  label: 'body',
  x: 0,
  y: 0
}];
var edges = [];
// queue will temporarily store all the nodes at a given layer.
// body is layer 0, body.children are layer -1, etc
var queue = [nodes[0]];

// we don't want to serialize elements, so instead of storing their references in node
// we put them here to provide an easy way to grab the actual element for a node.
var elements = {
  'n0': document.body
};

var isCustomElement = (target) => {
  return (target.tagName.indexOf('-') !== -1);
}

var getCustomChildren = (target) => {
  var result = [];

  if (target) {

    Array.from(target.children).forEach((item) => {
      if (isCustomElement(item)) {
        result.push(item);
        return;
      }
      if (item.children.length > 0) {
        result = result. concat(getCustomChildren(item));
      }
    });
  }
  return result;
}

while(queue.length > 0) {
  var targetNode = queue.shift();
  var nextLayer = [];
  var children = getCustomChildren(elements[targetNode.id]);

  children.forEach((item, index) => {
    var newNode = {
      id: ('n' + nodes.length),
      label: item.tagName.toLowerCase(),
      x: index,
      y: (targetNode.y - 1)
    };

    nodes.push(newNode);
    elements[newNode.id] = item;
    nextLayer.push(item);
    queue.push(newNode);

    edges.push({
      id: 'e' + edges.length,
      source: targetNode.id,
      sourceIndex: nodes.indexOf(targetNode),
      target: newNode.id,
      targetIndex: nodes.indexOf(newNode)
    });
  });

  if (queue.length === 0) {
    queue = queue.concat(nextLayer);
  }
}

var graph = {
  nodes: nodes,
  edges: edges
};

console.log("Transforming graph into format needed for visualization");

var getNode = (nodes, id) => {
  var matchId = (item) => {
    return item.id === id;
  }
  return nodes.find(matchId);
}

var getChildren = (graph, targetNode) => {
  var targetNode = getNode(graph.nodes, targetNode.id);
  var targetNodeIndex = graph.nodes.indexOf(targetNode);

  var childIndices = graph.edges.filter(edge => edge.sourceIndex === targetNodeIndex);
  return childIndices.map(edge => graph.nodes[edge.targetIndex]);
};

var buildNestedTree = (graph) => {
  var rootNode = graph.nodes[0];
  var children = getChildren(graph, rootNode);

  return {
    "name": rootNode.label,
    "parent": null,
    "children": children.map(child => buildNodeLiteral(graph, child, rootNode))
  }
};

var buildNodeLiteral = (graph, targetNode, parent) => {
  var childNodes = getChildren(graph, targetNode);
  var children = childNodes.map(child => buildNodeLiteral(graph, child, targetNode));
  if (children.length === 0) children = null;

  var obj = {
    "name": targetNode.label,
    "parent": parent.label
  };

  if (children) obj["children"] = children;

  return obj;
};

var nestedTreeData = buildNestedTree(graph);

copy(nestedTreeData);
console.log("Data copied to your clipboard! Please past it into 'treeData.json' and refresh 'treeView.html'. See the readme at https://github.com/ZempTime/polymer-graph-visualization for more details.");

