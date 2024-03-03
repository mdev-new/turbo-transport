export class AStar {
  nodes = [];
  edges = [];

  constructor(nodes, edges) {

    if(this.constructor == AStar) {
      throw new Error("`AStar` is an abstract class")
    }

    this.nodes = nodes
    this.edges = edges
  }

  /* return: the cost of taking an specific edge */
  edge_cost(edge) {
    throw new Error("`edge_cost` not implemented")
  }

  /* return: estimated cost of going from a node to the very end */
  cost_estimate(node) {
    throw new Error("`cost_estimate` not implemented")
  }

  /* return: bool ; true if equal, false otherwise */
  compare_nodes(a, b) {
    throw new Error("`compare_nodes` not implemented")
  }

  /* return: array of node's neighbours */
  neighbours(node) {
    throw new Error("`neighbours` not implemented")
  }

  /* do the actual A* */
  search(start, end) {
  }
}