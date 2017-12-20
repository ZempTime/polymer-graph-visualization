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
      }
      if (item.children.length > 0) {
        result = result.concat(getCustomChildren(item));
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

    edges.push({
      id: 'e' + edges.length,
      source: targetNode.id,
      target: newNode.id
    });
  });

  if (queue.length === 0) {
    Array.prototype.push.apply(queue, nextLayer);
  }
}

console.log(nodes);
console.log(edges);

  {
    "name": "Top Level",
    "children": [
      {
        "name": "Level 2: A",
        "children": [
          { "name": "Son of A" },
          { "name": "Daughter of A" }
        ]
      },
      { "name": "Level 2: B" }
    ]
  };

