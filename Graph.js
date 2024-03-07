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
      this.adjList.set(node, new Set())
    }
  }

  addWaySingleDir(n1, n2, edge) {
    this.addNode(n1)

    this.adjList.get(n1).add(new GraphEntry(n2, edge))
  }

  addWayBothDirs(n1, n2, edge) {
    this.addWaySingleDir(n1, n2, edge)
    this.addWaySingleDir(n2, n1, edge)
  }

  print() {
    for(const [k, v] of this.adjList.entries()) {
      console.log(k, v)
    }
  }

  get length() {
    let sum = 0
    for(const [k, v] of this.adjList.entries()) {
      sum += v.length
    }
    return sum
  }
}