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

    let node = this.adjList.get(n1)
    const entry = new GraphEntry(n2, edge)
    if(!node.includes(entry)) {
      node.push(entry)
    }
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