export class GraphEntry {
  constructor(node, edge) {
    this.node = node;
    this.edge = edge;
  }
}

export class Graph {
  adjList = {};

  addNode(node) {
    if(!this.adjList[node]) {
      this.adjList[node] = []
    }
  }

  addWaySingleDir(n1, n2, edge) {
    this.adjList[n1].push(new GraphEntry(n2, edge))
  }

  addWayBothDirs(n1, n2, edge) {
    this.adjList[n1].push(new GraphEntry(n2, edge))
    this.adjList[n2].push(new GraphEntry(n1, edge))
  }
}