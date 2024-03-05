export class GraphEntry {
  constructor(node, edge) {
    this.node = node;
    this.edge = edge;
  }
}

export class Graph {
  adjList = new Map();

  addNode(node) {
    if(!this.adjList[node]) {
      this.adjList.set(node, [])
    }
  }

  addWaySingleDir(n1, n2, edge) {
    this.adjList.get(n1).push(new GraphEntry(n2, edge))
  }

  addWayBothDirs(n1, n2, edge) {
    this.adjList.get(n1).push(new GraphEntry(n2, edge))
    this.adjList.get(n2).push(new GraphEntry(n1, edge))
  }

  print() {
    for(const [k, v] of this.adjList.entries()) {
      console.log(`${k.name} -> ${v.map(l => l.name).join(' ')}`)
    }
  }
}