export class GraphEntry {
  node = null;
  edge = null;

  constructor(node, edge) {
    this.node = node;
    this.edge = edge;
  }
}

export class Graph {
  adjList = new Map();

  addNode(node) {
    if(!this.adjList.has(node)) {
      this.adjList.set(node, [])
    }
  }

  addWaySingleDir(n1, n2, edge) {
    this.addNode(n1)
    this.adjList.get(n1).push(new GraphEntry(n2, edge))
  }

  addWayBothDirs(n1, n2, edge) {
    this.addNode(n1)
    this.addNode(n2)
    this.adjList.get(n1).push(new GraphEntry(n2, edge))
    this.adjList.get(n2).push(new GraphEntry(n1, edge))
  }

  print() {
    for(const [k, v] of this.adjList.entries()) {
      console.log(k, v)
    }
  }
}