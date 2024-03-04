class PathSearch extends AStar {
  constructor(graph, walk_speed, bus_snapshot) {
    super(graph)
    this.walk_speed = walk_speed
    this.bus_snapshot = bus_snapshot
  }

  /*
    nodeA: 1st node(/string if name of node)
    nodeB: 2nd node
   */
  compare_nodes(nodeA, nodeB) {

    if(typeof(nodeA) == typeof(nodeB)) {

      return nodeA === nodeB

    } else if(typeof(nodeA) === 'string') {

      return nodeA === nodeB.properties.name

    } else if(typeof(nodeB) === 'string') {

      return nodeB === nodeA.properties.name

    }
  }

  neighbours(node) {
    return node.connections;
  }

  // the weight will basically be the time
  edge_cost(edge) {
    if(edge.meanOfStransport == 'foot') {
      return edge.length / this.walk_speed
    } else if(edge.meanOfStransport == 'public') {
      // todo use live data

      // lets calc in hours
      const wait_time = 2/60;
      const ride_time = edge.length / /* speed, let's say avg 35kmh */ 35;

      return wait_time+ride_time

    } else if(edge.meanOfStransport == 'train') {
      // todo use live data

      // lets calc in hours
      const wait_time = 2/60;
      const ride_time = edge.length / /* speed, let's say avg 35kmh */ 35;

      return wait_time+ride_time

    } else if(edge.meanOfStransport == 'link_bus') {
      // todo use live data

      // lets calc in hours
      const wait_time = 2/60;
      const ride_time = edge.length / /* speed, let's say avg 35kmh */ 35;

      return wait_time+ride_time

    }
  }

  projected_cost(edge) {
    
  }
}